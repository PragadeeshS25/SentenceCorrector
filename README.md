# SentenceCorrector

AI-powered English sentence correction and paraphrasing web application.

## Overview

SentenceCorrector is a full-stack web application that uses artificial intelligence to help users improve their English writing.

The application can detect and correct:

- Grammar mistakes
- Spelling mistakes
- Punctuation mistakes
- Capitalization mistakes
- Subject-verb agreement
- Verb tense
- Incorrect word forms
- Sentence structure
- Writing style

It also provides AI-powered paraphrasing in different styles.

## Features

### AI Sentence Correction

Users can enter a sentence or paragraph and receive an AI-generated corrected version.

### Grammar Detection

Identifies common grammar mistakes and provides explanations.

### Spelling Detection

Detects spelling mistakes and suggests corrections.

### Style Detection

Identifies writing-style issues and provides improvements.

### Correction Modes

- Basic Correction
- Professional
- Academic
- Simple English

### Paraphrasing

Users can rewrite corrected text using:

- Professional
- Simple
- Formal
- Concise

### Before / After Comparison

The application displays the original text and corrected text side by side.

### Issue Analysis

Detected issues are categorized as:

- Grammar
- Spelling
- Style

Each issue includes:

- Original text
- Correction
- Explanation

### Copy

Users can copy:

- Corrected text
- Paraphrased text

### Responsive Design

The interface works on:

- Desktop
- Laptop
- Tablet
- Mobile

## Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express.js
- CORS
- dotenv

### AI

- Hugging Face Inference API
- Meta Llama 3.1 8B Instruct

### Database

No database is used.

## Project Structure

```text
SentenceCorrector/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md