/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License ats
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
    GoogleGenerativeAI,
  } from "@google/generative-ai";
  
  async function speechGeneration() {
    // [START speech_generation]
    // Make sure to include these imports:
    // import {
    //  GoogleGenerativeAI,
    // } from "@google/generative-ai";
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getSpeechGenerationModel({
      model: "imagen-3.0-generate-001",
    });
    const result = await model.generateSpeech("A fluffy cat");
    // [END speech_generation]
  }
  async function runAll() {
    // Comment out or delete any sample cases you don't want to run.
    await  speechGeneration();
  }
  
  runAll();
  