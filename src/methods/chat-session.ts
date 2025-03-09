/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  Content,
  GenerateContentRequest,
  GenerateContentResult,
  GenerateContentStreamResult,
  Part,
  RequestOptions,
  SingleRequestOptions,
  StartChatParams,
} from "../../types";
import { formatNewContent } from "../requests/request-helpers";
import { formatBlockErrorMessage } from "../requests/response-helpers";
import { isValidResponse, validateChatHistory } from "./chat-session-helpers";
import { generateContent, generateContentStream } from "./generate-content";
import { GenerativeModel } from "../models/generative-model";

/**
 * Do not log a message for this error.
 */
const SILENT_ERROR = "SILENT_ERROR";

/**
 * ChatSession class that enables sending chat messages and stores
 * history of sent and received messages so far.
 *
 * @public
 */
export class ChatSession {
  private _history: Content[] = [];
  private _sendPromise: Promise<void> = Promise.resolve();
  private _model: GenerativeModel;

  constructor(
    model: GenerativeModel,
    history: Content[] = [],
    private _requestOptions: RequestOptions = {},
  ) {
    this._model = model;
    this._history = history;
  }

  /**
   * Returns a copy of the chat history.
   */
  getHistory(): Content[] {
    return [...this._history];
  }

  /**
   * Sends a message to the model and adds the message and response to history.
   * @param message - The message to send.
   * @param requestOptions - Options for this specific request.
   */
  async sendMessage(
    message: string | Part | Array<string | Part>,
    requestOptions: SingleRequestOptions = {},
  ): Promise<GenerateContentResult> {
    // Wait for any pending send to complete before starting a new one.
    await this._sendPromise;

    // Create a new promise for this send operation.
    let resolveSendPromise: () => void;
    this._sendPromise = new Promise<void>((resolve) => {
      resolveSendPromise = resolve;
    });

    try {
      const formattedMessage = formatNewContent(message);
      validateChatHistory([...this._history, formattedMessage]);

      const result = await this._model.generateContent(
        [...this._history, formattedMessage],
        {
          ...this._requestOptions,
          ...requestOptions,
        },
      );

      if (!isValidResponse(result.response)) {
        throw new Error(
          formatBlockErrorMessage(result.response.promptFeedback),
        );
      }

      this._history.push(formattedMessage);
      this._history.push(result.response.candidates[0].content);

      return result;
    } catch (e) {
      if (e.message !== SILENT_ERROR) {
        throw e;
      }
      throw e;
    } finally {
      resolveSendPromise();
    }
  }

  /**
   * Sends a message to the model and adds the message to history.
   * Returns a stream of responses. The final response will be added to history.
   * @param message - The message to send.
   * @param requestOptions - Options for this specific request.
   */
  async sendMessageStream(
    message: string | Part | Array<string | Part>,
    requestOptions: SingleRequestOptions = {},
  ): Promise<GenerateContentStreamResult> {
    // Wait for any pending send to complete before starting a new one.
    await this._sendPromise;

    // Create a new promise for this send operation.
    let resolveSendPromise: () => void;
    this._sendPromise = new Promise<void>((resolve) => {
      resolveSendPromise = resolve;
    });

    try {
      const formattedMessage = formatNewContent(message);
      validateChatHistory([...this._history, formattedMessage]);

      const result = await this._model.generateContentStream(
        [...this._history, formattedMessage],
        {
          ...this._requestOptions,
          ...requestOptions,
        },
      );

      this._history.push(formattedMessage);

      // Add a callback to add the final response to history.
      const originalOnComplete = result.stream.on.complete;
      result.stream.on.complete = (completeResponse) => {
        if (isValidResponse(completeResponse)) {
          this._history.push(completeResponse.candidates[0].content);
        }
        if (originalOnComplete) {
          originalOnComplete(completeResponse);
        }
        resolveSendPromise();
      };

      return result;
    } catch (e) {
      resolveSendPromise();
      if (e.message !== SILENT_ERROR) {
        throw e;
      }
      throw e;
    }
  }
}
