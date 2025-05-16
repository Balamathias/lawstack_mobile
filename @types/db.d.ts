export interface User {
    id: string,
    username: string,
    email: string,
    first_name: string | null,
    last_name: string | null,
    is_active?: boolean,
    is_staff?: boolean,
    is_superuser?: boolean,
    avatar: string | null,
    phone: string | null,
    created_at: string,
    /** @deprecated: Date Joined would be removed in the future, use `joined` instead. */
    date_joined: string,
    joined: string
    institution: string | null,
    institution_name: string | null,
    is_subscribed: boolean,
    last_login: string | null,
}

export interface Question {
    id: string,
    text: string,
    text_plain: string | null,
    year: string,
    course: string,
    level: string,
    session: string | null,
    marks: number,
    semester: string,
    course_name: string,
    institution: string,
    institution_name: string,
    type: string,
    exam_type: string | null,
    tags: string[],
    created_at: string,
    updated_at: string | null,
    uploaded_by: string | User,
}

export interface QuestionSuggestion {
  id: string,
  text: string,
  year: string,
  course: string,
  semester: string,
  institution: string,
  session: string | null,
  tags: string[],
}

export interface Course {
    id: string,
    institution: string[],
    name: string,
    code: string,
    description: string,
    level: string,
    duration: string,
    credit_units: number,
    ordering: number | null,
    created_at: string,
    updated_at: string,
    institution_name?: string
}

export interface Bookmark {
    id: string,
    user: string | User,
    past_question: Question,
    created_at: string,
    updated_at: string | null,
}

export interface Contribution {
    id: string,
    text: string,
    past_question: string,
    contributor: User,
    upvotes_count: number,
    downvotes_count: number,
    created_at: string,
    updated_at: string | null,
}

export interface Note {
  id: string,
  title: string,
  content: string,
  author_name: string,
  created_at: string,
  updated_at: string,
  label: string
}

export interface Chat {
    id: string,
    title: string,
    chat_type: 'general' | 'course_specific' | 'past_question' | 'exam_prep',
    created_at: string,
    updated_at: string | null,
    course: string | null,
    course_name: string | null,
    past_question: string | null,
    past_question_text: string | null,
    message_preview: string | null,
    messages: Message[]
  }
  
export interface MessageAttachment {
  id: string;
  filename: string;
  file_type: string;
  size: number;
  url: string;
  created_at: string;
}

export interface Message {
    id: string,
    content: string,
    created_at: string,
    updated_at: string | null,
    feedback: string | null,
    sender: 'user' | 'ai',
    attachments?: MessageAttachment[] | null
}

export interface AIQuestion {
  id: string,
  question_text: string,
  option_a: string,
  option_b: string,
  option_c: string,
  option_d: string,
  correct_answer?: string, // Only available after quiz completion
  explanation?: string,    // Only available after quiz completion
  source_question: string,
  source_question_text: string,
  course: string,
  course_name: string,
  difficulty: 'easy' | 'medium' | 'hard',
  created_at: string
}

export interface QuizQuestion {
  id: string,
  order: number,
  question_id: string,
  question_text: string,
  options: {
    a: string,
    b: string,
    c: string,
    d: string
  },
  correct_answer?: string, // Only available after completion
  explanation?: string     // Only available after completion
}

export interface QuizAnswer {
  selected_option: string,
  is_correct: boolean,
  time_taken: number
}

export interface Quiz {
  id: string,
  title: string,
  course: string,
  course_name: string,
  status: 'pending' | 'in_progress' | 'completed' | 'expired',
  total_questions: number,
  correct_answers: number,
  duration: number, // in minutes
  started_at: string | null,
  completed_at: string | null,
  created_at: string,
  completion_time: number | null, // in seconds
  score: number,
  questions: QuizQuestion[],
  answers?: Record<string, QuizAnswer> // question_id -> answer data
}

export interface QuizStatistics {
  quizzes_completed: number,
  total_questions_answered: number,
  total_correct_answers: number,
  overall_accuracy: number,
  course_performance: {
    course_id: string,
    course_name: string,
    quizzes_taken: number,
    total_questions: number,
    correct_answers: number,
    accuracy: number
  }[],
  recent_performance: {
    quiz_id: string,
    title: string,
    course_name: string,
    completed_at: string,
    score: number,
    total_questions: number,
    correct_answers: number
  }[]
}

export interface SearchFilters {
  query?: string,
  institution?: string,
  course?: string,
  year?: string,
  type?: string,
  page?: number,
  limit?: number
}

export interface SearchResults {
  count: number,
  next: string | null,
  previous: string | null,
  past_questions: Question[],
  courses: Course[],
  institutions: Institution[]
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  paystack_plan_code?: string;
  description: string;
  features: string;
  is_active: boolean;
  label: string;
  discount_info_text?: string;
  discount_percent?: number;
  discount_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_percent: number;
  discount_amount: number;
  valid_from: string;
  valid_to: string;
  max_uses: number;
  used_count: number;
  is_active: boolean;
}

export type SubscriptionStatus = 'active' | 'pending' | 'expired' | 'canceled';

export interface Subscription {
  id: string;
  user: string | User;
  plan: Plan;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string;
  is_auto_renew: boolean;
  coupon?: Coupon | null;
  trial_end?: string | null;
  grace_period_end?: string | null;
  paystack_subscription_code?: string | null;
  paystack_email_token?: string | null;
  paystack_customer_code?: string | null;
  paystack_authorization_code?: string | null;
  paystack_last_payment?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionResponse {
  message: string;
  data: Subscription | Subscription[] | null;
  status: number;
  error: any;
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export interface PlanResponse {
  message: string;
  data: Plan | Plan[] | null;
  status: number;
  error: any;
}

export interface CouponResponse {
  message: string;
  data: Coupon | Coupon[] | null;
  status: number;
  error: any;
}

export interface PaystackInitResponse {
  message: string;
  data: { authorization_url: string } | null;
  status: number;
  error: any;
}


export interface UserStatistics {
  total_users: number;
  active_users: number;
  staff_users: number;
  admin_users: number;
  
  registration_stats: {
    today: number;
    yesterday: number;
    two_days_ago: number;
    this_week: number;
    last_week: number;
    this_month: number;
    last_month: number;
    this_quarter: number;
    this_year: number;
  };
  
  activity_stats: {
    active_today: number;
    active_this_week: number;
    active_this_month: number;
  };
}


export interface CourseAnalytics {
  course_info: Course;
  basic_stats: {
    views: number;
    institution_count: number;
    institutions: {
      id: string;
      name: string;
    }[];
  };
  past_question_stats: {
    total_count: number;
    by_year: { year: string; count: number }[];
    by_semester: { semester: string; count: number }[];
    by_type: { type: string; count: number }[];
    most_viewed: Question[];
  };
  ai_question_stats: {
    total_count: number;
    by_difficulty: { difficulty: string; count: number }[];
    by_semester: { semester: string; count: number }[];
  };
  quiz_stats: {
    total_created: number;
    completed: number;
    average_score: number;
    questions_answered: number;
    correct_answers: number;
  };
  user_engagement: {
    bookmarks: number;
    contributions: number;
    chats: number;
  };
  performance_trend: {
    quiz_id: string;
    title: string;
    score: number;
    completed_at: string | null;
  }[];
  generated_at: string;
}

export interface GlobalCourseAnalytics {
  summary: {
    total_courses: number;
    total_views: number;
    total_institutions: number;
    average_views_per_course: number;
    average_questions_per_course: number;
  };
  distributions: {
    by_institution_type: { type: string; course_count: number }[];
    by_level: { level: string; count: number }[];
  };
  top_content: {
    most_viewed: Course[];
    most_questions: {
      id: string;
      name: string;
      code: string;
      question_count: number;
    }[];
    most_quizzes: {
      id: string;
      name: string;
      code: string;
      quiz_count: number;
    }[];
  };
  engagement: {
    most_bookmarked: {
      id: string;
      name: string;
      code: string;
      bookmark_count: number;
    }[];
    most_active: {
      id: string;
      name: string;
      code: string;
      contribution_count: number;
    }[];
    most_chatted: {
      id: string;
      name: string;
      code: string;
      chat_count: number;
    }[];
  };
  top_institutions: {
    id: string;
    name: string;
    type: string;
    course_count: number;
  }[];
  generated_at: string;
}

export interface PastQuestionAnalytics {
  question: Question;
  basic_stats: {
    view_count: number;
    bookmark_count: number;
    contribution_count: number;
    average_views: number;
  };
  engagement: {
    bookmarks_count: number;
    views_count: number;
    contributions_count: number;
    user_interactions: number;
  };
  contributions: {
    total: number;
    recent: Contribution[];
    top_contributors: {
      user_id: string;
      username: string;
      avatar: string | null;
      contribution_count: number;
    }[];
  };
  related_questions: Question[];
  tags: {
    id: string;
    name: string;
    count: number;
  }[];
  course: {
    id: string;
    name: string;
    code: string;
    question_count: number;
  };
  institution: {
    id: string;
    name: string;
    question_count: number;
  };
  ai_generated_questions: AIQuestion[];
  generated_at: string;
}

export interface GlobalPastQuestionAnalytics {
  summary: {
    total_questions: number;
    total_views: number;
    total_bookmarks: number;
    total_contributions: number;
    average_views_per_question: number;
  };
  distributions: {
    by_type: { type: string; count: number }[];
    by_year: { year: string; count: number }[];
    by_semester: { semester: string; count: number }[];
  };
  top_content: {
    most_viewed: Question[];
    most_bookmarked: Question[];
    most_discussed: Question[];
  };
  top_entities: {
    institutions: {
      id: string;
      name: string;
      question_count: number;
    }[];
    courses: {
      id: string;
      name: string;
      code: string;
      question_count: number;
    }[];
    tags: {
      id: string;
      name: string;
      question_count: number;
    }[];
  };
  generated_at: string;
}

export interface GlobalChatAnalytics {
  summary: {
    total_chats: number;
    active_chats: number;
    inactive_chats: number;
    total_messages: number;
    avg_messages_per_chat: number;
  };
  time_based: {
    chats_last_24h: number;
    chats_last_week: number;
    chats_last_month: number;
    chats_per_day_avg: number;
  };
  distributions: {
    by_type: { chat_type: string; count: number }[];
    message_types: { sender: string; count: number }[];
    feedback: { feedback: string; count: number }[];
  };
  popular_content: {
    courses: {
      id: string;
      name: string;
      code: string;
      chat_count: number;
    }[];
    past_questions: {
      id: string;
      text: string;
      year: string;
      semester: string;
      chat_count: number;
    }[];
  };
  user_engagement: {
    most_active_users: {
      id: string;
      username: string;
      chat_count: number;
    }[];
  };
  generated_at: string;
}

export interface GlobalQuizAnalytics {
  summary: {
    total_quizzes: number;
    completed_quizzes: number;
    in_progress_quizzes: number;
    pending_quizzes: number;
    expired_quizzes: number;
    completion_rate: number;
    average_score: number;
    average_completion_time_minutes: number;
  };
  questions: {
    total_questions: number;
    total_answers: number;
    correct_answers: number;
    accuracy_rate: number;
    difficulty_distribution: { difficulty: string; count: number }[];
  };
  time_based: {
    quizzes_last_24h: number;
    quizzes_last_week: number;
    quizzes_last_month: number;
    daily_average_last_month: number;
    completions_by_day: Record<string, number>;
  };
  course_analytics: {
    id: string;
    name: string;
    code: string;
    quiz_count: number;
    completed_count: number;
    average_score: number;
  }[];
  user_engagement: {
    id: string;
    username: string;
    quiz_count: number;
    completed_count: number;
    average_score: number;
  }[];
  difficult_questions: {
    question_id: string;
    question_text: string;
    correct_rate: number;
    attempt_count: number;
  }[];
  generated_at: string;
}