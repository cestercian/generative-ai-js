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
  BatchEmbedContentsRequest,
  BatchEmbedContentsResponse,
  EmbedContentRequest,
  EmbedContentResponse,
  SingleRequestOptions,
} from "../../types";
import { Task, makeModelRequest } from "../requests/request";

export async function embedContent(
  model: string,
  apiKey: string | undefined,
  params: EmbedContentRequest,
  requestOptions?: SingleRequestOptions,
  useAdc: boolean = false,
): Promise<EmbedContentResponse> {
  const response = await makeModelRequest(
    model,
    Task.EMBED_CONTENT,
    apiKey,
    /* stream */ false,
    JSON.stringify(params),
    requestOptions,
    fetch,
    useAdc,
  );
  return response.json();
}

export async function batchEmbedContents(
  model: string,
  apiKey: string | undefined,
  params: BatchEmbedContentsRequest,
  requestOptions?: SingleRequestOptions,
  useAdc: boolean = false,
): Promise<BatchEmbedContentsResponse> {
  const response = await makeModelRequest(
    model,
    Task.BATCH_EMBED_CONTENTS,
    apiKey,
    /* stream */ false,
    JSON.stringify(params),
    requestOptions,
    fetch,
    useAdc,
  );
  return response.json();
}
