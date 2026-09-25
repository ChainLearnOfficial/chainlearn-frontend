# API Functions Documentation

This directory contains all API interaction functions for the ChainLearn frontend.

## Table of Contents

- [Course Content Functions](#course-content-functions)
- [Quiz Functions](#quiz-functions)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)

## Course Content Functions

### `getModule` / `getModuleContent`

Fetches complete module content including lessons and materials.

```typescript
import { getModule } from '@/lib/api/courses';

// Fetch module content
const module = await getModule('course-123', 'module-456', jwt);

// Or use the more explicit alias
import { getModuleContent } from '@/lib/api/courses';
const content = await getModuleContent('course-123', 'module-456', jwt);
```

**Parameters:**
- `courseId`: string - The course ID
- `moduleId`: string - The module ID  
- `jwt?`: string - Optional JWT token (required for enrolled courses)
- `signal?`: AbortSignal - Optional cancellation signal

**Returns:** `Promise<Module>` with fields:
- `id`: Module identifier
- `courseId`: Parent course ID
- `title`: Module title
- `description`: Short description
- `content`: Full HTML/Markdown content
- `contentType`: "text" | "video" | "interactive"
- `order`: Module order in course
- `estimatedMinutes`: Estimated completion time
- `isCompleted`: Whether user completed this module

### `getCourseModules`

Convenience function to fetch all modules for a course, sorted by order.

```typescript
import { getCourseModules } from '@/lib/api/courses';

const modules = await getCourseModules('course-123', jwt);
// Returns sorted array of all course modules
```

### `getModuleBatch`

Fetch multiple modules efficiently in parallel.

```typescript
import { getModuleBatch } from '@/lib/api/courses';

const moduleIds = ['mod-1', 'mod-2', 'mod-3'];
const modules = await getModuleBatch('course-123', moduleIds, jwt);
// Returns modules in same order as moduleIds
```

## Quiz Functions

### `getQuiz`

Fetches quiz content for a course.

```typescript
import { getQuiz } from '@/lib/api/quizzes';

const quiz = await getQuiz('course-123', jwt);
```

**Returns:** `Promise<Quiz>` with:
- `id`: Quiz identifier
- `courseId`: Parent course ID
- `title`: Quiz title
- `questions`: Array of questions with options
- `passingScore`: Minimum percentage to pass
- `rewardTokenAmount`: Tokens earned on passing
- `timeLimitMinutes`: Optional time limit

### `submitQuiz`

Submits quiz answers and receives score.

```typescript
import { submitQuiz } from '@/lib/api/quizzes';

const submission = {
  quizId: 'quiz-123',
  answers: [
    { questionId: 'q1', selectedOptionId: 'opt-a' },
    { questionId: 'q2', selectedOptionId: 'opt-b' },
  ]
};

const attempt = await submitQuiz(submission, jwt);
console.log(`Score: ${attempt.score}%`);
console.log(`Passed: ${attempt.passed}`);
```

**Returns:** `Promise<QuizAttempt>` with:
- `id`: Attempt identifier
- `score`: Score percentage (0-100)
- `passed`: Whether score met passing threshold
- `answers`: Array with correctness for each answer
- `rewardClaimed`: Whether tokens were claimed

### `getQuizAttempts`

Fetches user's past attempts for review.

```typescript
import { getQuizAttempts } from '@/lib/api/quizzes';

const attempts = await getQuizAttempts('quiz-123', jwt);
const bestScore = Math.max(...attempts.map(a => a.score));
```

## Authentication

All authenticated functions automatically handle token refresh using `getValidToken()`. Tokens are refreshed within 1 hour of expiry.

```typescript
// Manual token refresh
import { getValidToken } from '@/lib/api/auth';

const freshToken = await getValidToken();
// Returns refreshed token or null if session expired
```

## Error Handling

All API functions throw `ApiError` on failure:

```typescript
import { ApiError } from '@/types/api';
import { getModule } from '@/lib/api/courses';

try {
  const module = await getModule('course-123', 'module-456', jwt);
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error ${error.status}: ${error.message}`);
    if (error.status === 401) {
      // Handle authentication failure
    } else if (error.status === 404) {
      // Handle not found
    }
  }
}
```

**Request Cancellation:**

```typescript
const controller = new AbortController();

// Start request
const modulePromise = getModule('course-123', 'mod-456', jwt, controller.signal);

// Cancel if needed
controller.abort();

try {
  await modulePromise;
} catch (error) {
  if (isAbortError(error)) {
    console.log('Request was cancelled');
  }
}
```

## Usage Examples

### Fetching Course Content Flow

```typescript
import { 
  getCourse, 
  getCourseModules, 
  getModule,
  getQuiz 
} from '@/lib/api';

// 1. Get course overview
const course = await getCourse('course-123', jwt);

// 2. Get all modules sorted
const modules = await getCourseModules('course-123', jwt);

// 3. Fetch first module content
const firstModule = await getModule(
  'course-123', 
  modules[0].id, 
  jwt
);

// 4. Get course quiz
const quiz = await getQuiz('course-123', jwt);
```

### Preloading Content

```typescript
import { getModuleBatch } from '@/lib/api';

// Preload next 3 modules for smooth navigation
const nextModuleIds = ['mod-2', 'mod-3', 'mod-4'];
const preloadedModules = await getModuleBatch(
  'course-123',
  nextModuleIds,
  jwt
);

// Cache in state or local storage
```

### Taking a Quiz

```typescript
import { getQuiz, submitQuiz } from '@/lib/api';

// 1. Load quiz
const quiz = await getQuiz('course-123', jwt);

// 2. User answers questions
const userAnswers = [
  { questionId: quiz.questions[0].id, selectedOptionId: 'opt-1' },
  { questionId: quiz.questions[1].id, selectedOptionId: 'opt-2' },
];

// 3. Submit answers
const attempt = await submitQuiz({
  quizId: quiz.id,
  answers: userAnswers
}, jwt);

// 4. Show results
if (attempt.passed) {
  console.log(`Congratulations! You earned ${quiz.rewardTokenAmount} tokens!`);
} else {
  console.log(`Score: ${attempt.score}%. Passing: ${quiz.passingScore}%`);
}
```

## API Endpoint Structure

The functions call these endpoints:

- `GET /courses` - List courses with pagination
- `GET /courses/:courseId` - Get course with modules
- `GET /courses/:courseId/modules/:moduleId` - Get module content
- `POST /courses/:courseId/modules/:moduleId/complete` - Mark complete
- `GET /courses/:courseId/quiz` - Get course quiz
- `POST /quizzes/:quizId/submit` - Submit quiz answers
- `GET /quizzes/:quizId/attempts` - Get past attempts

All endpoints use the base URL from `NEXT_PUBLIC_API_URL` environment variable.
