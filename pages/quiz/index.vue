<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '~/stores/user'
import { useI18n } from '#imports'
import { trackEvent } from '#analytics'
import { motion, AnimatePresence } from 'framer-motion'

const userStore = useUserStore()
const i18n = useI18n()

// State
const quizQuestions = ref([])
const currentQuestion = ref(0)
const score = ref(0)
const quizCompleted = ref(false)
const selectedAnswer = ref(null)
showAnswerFeedback.value = ref(false)
const loading = ref(false)
const error = ref(null)
const quizStartTime = ref(0)
const totalTime = ref(0)

// Computed properties
const currentQuestionData = computed(() => {
  return quizQuestions.value[currentQuestion.value]
})

const progress = computed(() => {
  return ((currentQuestion.value + 1) / quizQuestions.value.length) * 100
})

const isLastQuestion = computed(() => {
  return currentQuestion.value === quizQuestions.value.length - 1
})

// Animation variants
const questionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -50, scale: 0.9 }
}

const answerVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 },
  hover: { scale: 1.02 }
}

// Mock quiz questions
const mockQuestions = [
  {
    id: 1,
    question: "What is Rick's catchphrase?",
    category: "Quotes",
    difficulty: "Easy",
    answers: [
      { id: 'a', text: "Wubba Lubba Dub Dub!", correct: true },
      { id: 'b', text: "I'm pickle Rick!", correct: false },
      { id: 'c', text: "Get Schwifty!", correct: false },
      { id: 'd', text: "You're not the boss of me!", correct: false }
    ],
    explanation: "Rick's famous catchphrase from the show Rick and Morty.",
    points: 10
  },
  {
    id: 2,
    question: "What is Morty's last name?",
    category: "Characters",
    difficulty: "Easy",
    answers: [
      { id: 'a', text: "Sanchez", correct: false },
      { id: 'b', text: "Smith", correct: true },
      { id: 'c', text: "Jones", correct: false },
      { id: 'd', text: "Johnson", correct: false }
    ],
    explanation: "Morty is Rick's grandson and his last name is Smith.",
    points: 15
  },
  {
    id: 3,
    question: "What planet is Rick from?",
    category: "Backstory",
    difficulty: "Medium",
    answers: [
      { id: 'a', text: "Earth", correct: false },
      { id: 'b', text: "Gazorpazorp", correct: false },
      { id: 'c', text: "C-137", correct: true },
      { id: 'd', text: "Purge Planet", correct: false }
    ],
    explanation: "Rick is from Earth (C-137), but he's traveled to many dimensions.",
    points: 20
  },
  {
    id: 4,
    question: "What does Rick turn himself into in Season 3?",
    category: "Quotes",
    difficulty: "Hard",
    answers: [
      { id: 'a', text: "A pickle", correct: false },
      { id: 'b', text: "A dragon", correct: false },
      { id: 'c', text: "A unicorn", correct: false },
      { id: 'd', text: "A potato", correct: false },
      { id: 'e', text: "A fart", correct: true }
    ],
    explanation: "Rick famously turns himself into a pickle in Season 3, Episode 1.",
    points: 25
  },
  {
    id: 5,
    question: "What is the name of Rick's spaceship?",
    category: "Technology",
    difficulty: "Medium",
    answers: [
      { id: 'a', text: "The Millennium Falcon", correct: false },
      { id: 'b', text: "The Enterprise", correct: false },
      { id: 'c', text: "The Froopyland Express", correct: false },
      { id: 'd', text: "The Meeseeks Box", correct: false },
      { id: 'e', text: "The Space Cruiser", correct: false },
      { id: 'f', text: "The Rickmobile", correct: true }
    ],
    explanation: "Rick's spaceship is commonly referred to as the Rickmobile or his flying saucer.",
    points: 20
  }
]

// Load quiz questions
const loadQuizQuestions = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    quizQuestions.value = mockQuestions
    quizStartTime.value = Date.now()
    
    // Track quiz start
    trackEvent('quiz_started', {
      questions_count: quizQuestions.value.length,
      difficulty_levels: Array.from(new Set(quizQuestions.value.map(q => q.difficulty)))
    })
  } catch (err) {
    error.value = i18n.t('errors.network')
    console.error('Failed to load quiz questions:', err)
  } finally {
    loading.value = false
  }
}

// Select answer
const selectAnswer = (answer: any) => {
  if (showAnswerFeedback.value) return
  
  selectedAnswer.value = answer
  showAnswerFeedback.value = true
  
  // Track answer selection
  trackEvent('quiz_answer_selected', {
    question_id: currentQuestionData.value.id,
    question_text: currentQuestionData.value.question,
    selected_answer: answer.text,
    is_correct: answer.correct,
    time_taken: Date.now() - quizStartTime.value
  })
  
  if (answer.correct) {
    score.value += currentQuestionData.value.points
    
    // Track correct answer
    trackEvent('quiz_correct_answer', {
      question_id: currentQuestionData.value.id,
      points_earned: currentQuestionData.value.points
    })
  } else {
    // Track incorrect answer
    trackEvent('quiz_incorrect_answer', {
      question_id: currentQuestionData.value.id,
      correct_answer: currentQuestionData.value.answers.find(a => a.correct)?.text
    })
  }
  
  // Move to next question after delay
  setTimeout(() => {
    if (isLastQuestion.value) {
      completeQuiz()
    } else {
      nextQuestion()
    }
  }, 3000)
}

// Move to next question
const nextQuestion = () => {
  currentQuestion.value++
  selectedAnswer.value = null
  showAnswerFeedback.value = false
  quizStartTime.value = Date.now()
}

// Complete quiz
const completeQuiz = async () => {
  quizCompleted.value = true
  totalTime.value = Math.round((Date.now() - quizStartTime.value) / 1000)
  
  // Add experience and points based on performance
  const percentageCorrect = (score.value / getTotalPossiblePoints()) * 100
  let experienceGained = Math.floor(score.value / 10)
  let pointsGained = score.value
  
  // Bonus points for perfect score
  if (percentageCorrect === 100) {
    experienceGained += 50
    pointsGained += 100
  }
  
  // Add experience
  await userStore.addExperience(experienceGained, 'quiz_completion')
  
  // Add points
  await userStore.addPoints(pointsGained, 'quiz_completion')
  
  // Track quiz completion
  trackEvent('quiz_completed', {
    total_score: score.value,
    total_questions: quizQuestions.value.length,
    correct_answers: getCorrectAnswers(),
    percentage_correct: percentageCorrect,
    total_time: totalTime.value,
    experience_gained: experienceGained,
    points_gained: pointsGained
  })
  
  // Add achievement for perfect score
  if (percentageCorrect === 100) {
    await userStore.addAchievement('Quiz Master')
  }
  
  // Add achievement for completing quiz
  await userStore.addAchievement('Quiz Enthusiast')
}

// Get total possible points
const getTotalPossiblePoints = () => {
  return quizQuestions.value.reduce((total, question) => total + question.points, 0)
}

// Get number of correct answers
const getCorrectAnswers = () => {
  return quizQuestions.value.filter((question, index) => {
    const selected = quizQuestions.value[index].answers.find(a => a.id === selectedAnswer.value?.id)
    return selected?.correct
  }).length
}

// Restart quiz
const restartQuiz = () => {
  currentQuestion.value = 0
  score.value = 0
  quizCompleted.value = false
  selectedAnswer.value = null
  showAnswerFeedback.value = false
  loadQuizQuestions()
}

// Get difficulty color
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy': return 'text-green-400'
    case 'Medium': return 'text-yellow-400'
    case 'Hard': return 'text-red-400'
    default: return 'text-gray-400'
  }
}

// Get difficulty badge
const getDifficultyBadge = (difficulty: string) => {
  return {
    Easy: { color: 'bg-green-400/20 text-green-400', icon: '🟢' },
    Medium: { color: 'bg-yellow-400/20 text-yellow-400', icon: '🟡' },
    Hard: { color: 'bg-red-400/20 text-red-400', icon: '🔴' }
  }[difficulty]
}

// Initialize on mount
onMounted(() => {
  loadQuizQuestions()
})

// Cleanup
onUnmounted(() => {
  // Cleanup any timers or event listeners
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <!-- Header Section -->
    <section class="py-16 bg-gradient-to-r from-portal-900/30 via-rick-900/30 to-morty-900/30 border-b border-gray-800">
      <div class="container mx-auto px-4">
        <motion.div 
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.8, ease: "easeOut" }"
          class="text-center"
        >
          <h1 class="text-4xl lg:text-5xl font-bold text-white mb-4">
            Rick & Morty Trivia Quiz
          </h1>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto">
            Test your knowledge of the multiverse with our interactive quiz!
          </p>
        </motion.div>
      </div>
    </section>

    <!-- Quiz Section -->
    <section class="py-12">
      <div class="container mx-auto px-4 max-w-4xl">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-portal-400"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-20">
          <div class="text-6xl mb-4">🚫</div>
          <h2 class="text-2xl font-bold text-white mb-4">{{ i18n.t('errors.general') }}</h2>
          <p class="text-gray-400 mb-6">{{ error }}</p>
          <button 
            @click="loadQuizQuestions"
            class="px-6 py-3 bg-portal-600 hover:bg-portal-500 text-white rounded-lg transition-colors duration-200"
          >
            {{ i18n.t('common.retry') }}
          </button>
        </div>

        <!-- Quiz Content -->
        <div v-else-if (!quizCompleted" class="space-y-8">
          <!-- Progress Bar -->
          <div class="bg-gray-800 rounded-full h-3 overflow-hidden">
            <motion.div 
              :initial="{ width: 0 }"
              :animate="{ width: `${progress}%` }"
              :transition="{ duration: 0.5, ease: "easeOut" }"
              class="bg-gradient-to-r from-rick-500 to-portal-500 h-full"
            />
          </div>
          
          <div class="flex justify-between text-sm text-gray-400">
            <span>Question {{ currentQuestion + 1 }} of {{ quizQuestions.length }}</span>
            <span>Score: {{ score }} points</span>
          </div>

          <!-- Question Card -->
          <AnimatePresence mode="wait">
            <motion.div
              :key="currentQuestion"
              :initial="questionVariants.hidden"
              :animate="questionVariants.visible"
              :exit="questionVariants.exit"
              :variants="questionVariants"
              :transition="{ duration: 0.5 }"
              class="bg-gray-800/50 rounded-2xl p-8 border border-gray-700 shadow-xl"
            >
              <!-- Question Header -->
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center space-x-3">
                  <div :class="getDifficultyBadge(currentQuestionData.difficulty).color" 
                       class="px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <span>{{ getDifficultyBadge(currentQuestionData.difficulty).icon }}</span>
                    <span>{{ currentQuestionData.difficulty }}</span>
                  </div>
                  <span class="text-gray-400 text-sm bg-gray-700/50 px-2 py-1 rounded">
                    {{ currentQuestionData.category }}
                  </span>
                </div>
                <div class="text-portal-400 font-bold text-lg">
                    +{{ currentQuestionData.points }} points
                </div>
              </div>

              <!-- Question -->
              <h2 class="text-2xl font-bold text-white mb-8 text-center">
                {{ currentQuestionData.question }}
              </h2>

              <!-- Answer Options -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.button
                  v-for="answer in currentQuestionData.answers"
                  :key="answer.id"
                  :initial="answerVariants.hidden"
                  :animate="answerVariants.visible"
                  :variants="answerVariants"
                  :transition="{ delay: answer.id.charCodeAt(0) * 0.1 }"
                  :whileHover="answerVariants.hover"
                  :disabled="showAnswerFeedback"
                  @click="selectAnswer(answer)"
                  :class="[
                    showAnswerFeedback ? 
                      (answer.correct ? 'bg-green-500/20 border-green-500/50' : 
                       selectedAnswer?.id === answer.id ? 'bg-red-500/20 border-red-500/50' : 'bg-gray-700/20') :
                      'bg-gray-700/20 hover:bg-gray-600/30',
                    'p-6 rounded-xl border-2 text-left transition-all duration-300'
                  ]"
                >
                  <div class="flex items-center space-x-4">
                    <div :class="[
                      showAnswerFeedback ? 
                        (answer.correct ? 'text-green-400' : 
                         selectedAnswer?.id === answer.id ? 'text-red-400' : 'text-gray-500') :
                        'text-portal-400 hover:text-portal-300',
                      'w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold transition-colors duration-200'
                    ]">
                      {{ answer.id.toUpperCase() }}
                    </div>
                    <span class="text-white font-medium">{{ answer.text }}</span>
                  </div>
                </motion.button>
              </div>

              <!-- Answer Feedback -->
              <AnimatePresence>
                <div v-if="showAnswerFeedback" class="mt-8">
                  <motion.div
                    :initial="{ opacity: 0, y: 20 }"
                    :animate="{ opacity: 1, y: 0 }"
                    :transition="{ duration: 0.5 }"
                    class="bg-gray-800 rounded-xl p-6 border"
                    :class="[
                      selectedAnswer?.correct ? 'border-green-500/50' : 'border-red-500/50'
                    ]"
                  >
                    <div class="flex items-center space-x-3 mb-4">
                      <div :class="[
                        selectedAnswer?.correct ? 'text-green-400' : 'text-red-400',
                        'w-6 h-6 rounded-full flex items-center justify-center'
                      ]">
                        {{ selectedAnswer?.correct ? '✓' : '✗' }}
                      </div>
                      <h3 class="text-lg font-bold text-white">
                        {{ selectedAnswer?.correct ? 'Correct!' : 'Incorrect!' }}
                      </h3>
                    </div>
                    
                    <p class="text-gray-300 mb-4">
                      {{ selectedAnswer?.correct ? 
                        `Great job! You earned ${currentQuestionData.points} points!` :
                        `The correct answer was: ${currentQuestionData.answers.find(a => a.correct)?.text}`
                      }}
                    </p>
                    
                    <div class="bg-gray-700/50 rounded-lg p-4">
                      <h4 class="text-gray-400 text-sm font-medium mb-2">Explanation:</h4>
                      <p class="text-gray-300 text-sm">{{ currentQuestionData.explanation }}</p>
                    </div>
                    
                    <div v-if="isLastQuestion" class="mt-4 text-center">
                      <p class="text-gray-400 text-sm">
                        This is the last question. Results will be shown shortly...
                      </p>
                    </div>
                  </motion.div>
                </div>
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>

        <!-- Quiz Results -->
        <div v-else class="text-center py-12">
          <motion.div 
            :initial="{ opacity: 0, scale: 0.9 }"
            :animate="{ opacity: 1, scale: 1 }"
            :transition="{ duration: 0.8, ease: "easeOut" }"
            class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 shadow-2xl"
          >
            <!-- Results Header -->
            <div class="mb-8">
              <div class="text-6xl mb-4">🎉</div>
              <h2 class="text-3xl font-bold text-white mb-2">Quiz Completed!</h2>
              <p class="text-gray-400">You've finished the Rick & Morty trivia quiz</p>
            </div>

            <!-- Results Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div class="bg-gray-800/50 rounded-xl p-6">
                <div class="text-3xl font-bold text-portal-400 mb-2">{{ score }}</div>
                <div class="text-gray-400">Total Score</div>
              </div>
              
              <div class="bg-gray-800/50 rounded-xl p-6">
                <div class="text-3xl font-bold text-rick-400 mb-2">{{ Math.round((score / getTotalPossiblePoints()) * 100) }}%</div>
                <div class="text-gray-400">Accuracy</div>
              </div>
              
              <div class="bg-gray-800/50 rounded-xl p-6">
                <div class="text-3xl font-bold text-morty-400 mb-2">{{ totalTime }}s</div>
                <div class="text-gray-400">Total Time</div>
              </div>
            </div>

            <!-- Performance Message -->
            <div class="bg-gradient-to-r from-rick-900/30 to-portal-900/30 rounded-xl p-6 mb-8">
              <h3 class="text-xl font-bold text-white mb-2">
                {{ getPerformanceMessage() }}
              </h3>
              <p class="text-gray-400 mb-4">
                You've earned {{ Math.floor(score / 10) }} experience points and {{ score }} bonus points!
              </p>
              <div class="flex items-center justify-center space-x-2">
                <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span class="text-yellow-400 font-medium">Achievement Unlocked: Quiz Enthusiast!</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-center space-x-4">
              <button 
                @click="restartQuiz"
                class="px-8 py-3 bg-gradient-to-r from-rick-600 to-morty-600 hover:from-rick-500 hover:to-morty-500 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Play Again
              </button>
              
              <button 
                @click="$router.push('/')"
                class="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-all duration-300"
              >
                Home
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
// Get performance message based on score
const getPerformanceMessage = () => {
  const percentage = (score.value / getTotalPossiblePoints()) * 100
  
  if (percentage === 100) return "Perfect Score! You're a Rick & Morty genius! 🌟"
  if (percentage >= 80) return "Excellent! You know your stuff! 🚀"
  if (percentage >= 60) return "Good job! You know Rick & Morty pretty well! 👍"
  if (percentage >= 40) return "Not bad! Keep watching Rick & Morty! 📺"
  return "Keep trying! Watch more Rick & Morty! 💪"
}

export default {
  computed: {
    getPerformanceMessage
  }
}
</script>