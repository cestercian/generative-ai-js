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
  GenerateContentRequest,
  GenerateContentResponse,
  GenerateContentResult,
  GenerateContentStreamResult,
  SingleRequestOptions,
  StreamCallbacks,
} from "../../types";
import { Task, makeModelRequest } from "../requests/request";
import { addHelpers } from "../requests/response-helpers";
import { processStream } from "../requests/stream-reader";

/**
 * Generates content from the model with streaming enabled.
 * @param model - The model to use
 * @param apiKey - The API key to use for authentication
 * @param params - The parameters for the request
 * @param requestOptions - Options for the request
 * @param callbacks - Callbacks for the stream
 * @param useAdc - Whether to use Application Default Credentials
 * @returns A promise that resolves to a GenerateContentStreamResult
 */
export async function generateContentStream(
  model: string,
  apiKey: string | undefined,
  params: GenerateContentRequest,
  requestOptions: SingleRequestOptions,
  callbacks?: StreamCallbacks,
  useAdc: boolean = false,
): Promise<GenerateContentStreamResult> {
  const response = await makeModelRequest(
    model,
    Task.STREAM_GENERATE_CONTENT,
    apiKey,
    /* stream */ true,
    JSON.stringify(params),
    requestOptions,
    fetch,
    useAdc,
  );
  return processStream(response, callbacks);
}

/**
 * Generates content from the model without streaming.
 * @param model - The model to use
 * @param apiKey - The API key to use for authentication
 * @param params - The parameters for the request
 * @param requestOptions - Options for the request
 * @param useAdc - Whether to use Application Default Credentials
 * @returns A promise that resolves to a GenerateContentResult
 */
export async function generateContent(
  model: string,
  apiKey: string | undefined,
  params: GenerateContentRequest,
  requestOptions?: SingleRequestOptions,
  useAdc: boolean = false,
): Promise<GenerateContentResult> {
  const response = await makeModelRequest(
    model,
    Task.GENERATE_CONTENT,
    apiKey,
    /* stream */ false,
    JSON.stringify(params),
    requestOptions,
    fetch,
    useAdc,
  );
  const responseJson: GenerateContentResponse = await response.json();
  const enhancedResponse = addHelpers(responseJson);
  return {
    response: enhancedResponse,
  };
}
