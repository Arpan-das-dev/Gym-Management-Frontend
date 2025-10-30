export interface plansResponseModel {
    /**
     * Unique identifier of the plan.
     * Example: "BASIC_2026"
     */
    planId: string;

    /**
     * Human-readable name of the plan.
     * Example: "Basic Plan"
     */
    planName: string;

    /**
     * Price of the plan in the applicable currency.
     * Represented as a Double value.
     */
    price: number;

    /**
     * Duration of the plan in days.
     * Example: 365 for a yearly plan.
     */
    duration: number;

    /**
     * List of features included in the plan.
     * Each feature is represented as a String.
     */
    planFeatures: string[];
}
