import { Task } from "@/types/task";

interface SortStrategy {
  sort(tasks: Task[]): Task[];
}

class BaseSortStrategy implements SortStrategy {
  constructor(private comparator: (a: Task, b: Task) => number) {}

  sort(tasks: Task[]): Task[] {
    return [...tasks].sort(this.comparator);
  }
}

export class SortByTitle extends BaseSortStrategy {
  constructor() {
    super((a, b) => a.title.localeCompare(b.title));
  }
}

export class SortByCompletion extends BaseSortStrategy {
  constructor() {
    super((a, b) => Number(a.completed) - Number(b.completed));
  }
}

export class TaskSorter {
  constructor(private strategy: SortStrategy) {}

  setStrategy(strategy: SortStrategy) {
    this.strategy = strategy;
  }

  sort(tasks: Task[]): Task[] {
    return this.strategy.sort(tasks);
  }
}
