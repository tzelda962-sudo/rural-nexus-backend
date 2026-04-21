export interface CompleteAssignmentInput {
  assignmentId: string;
  hoursLogged: number;
}

export interface CompleteAssignment {
  execute(input: CompleteAssignmentInput): Promise<void>;
}
