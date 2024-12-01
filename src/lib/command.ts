import { Task, TaskAction, TaskActions } from "@/types/task";
import { Dispatch } from "react";
import { commands_subject } from "./observer";

export interface Command<T extends TaskAction> {
  action: T;
  undo_action: TaskAction;
  task: Task;
  execute(dispatch: Dispatch<TaskActions>): void;
  undo(dispatch: Dispatch<TaskActions>): void;
}

class BaseTaskCommand<T extends TaskAction> implements Command<T> {
  constructor(
    public task: Task,
    public action: T,
    public undo_action: TaskAction
  ) {}

  execute(dispatch: Dispatch<TaskActions>) {
    dispatch({ type: this.action, payload: this.task });
    commands_subject.next(this);
  }

  undo(dispatch: Dispatch<TaskActions>) {
    dispatch({ type: this.undo_action, payload: this.task });
  }
}

export class AddTaskCommand extends BaseTaskCommand<TaskAction.ADD> {
  constructor(task: Task) {
    super(task, TaskAction.ADD, TaskAction.REMOVE);
  }
}

export class RemoveTaskCommand extends BaseTaskCommand<TaskAction.REMOVE> {
  constructor(task: Task) {
    super(task, TaskAction.REMOVE, TaskAction.ADD);
  }
}

export class ToggleTaskCommand extends BaseTaskCommand<TaskAction.TOGGLE> {
  constructor(task: Task) {
    super(task, TaskAction.TOGGLE, TaskAction.TOGGLE);
  }
}

export type TaskCommand =
  | AddTaskCommand
  | RemoveTaskCommand
  | ToggleTaskCommand;
