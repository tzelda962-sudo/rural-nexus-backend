export interface WithdrawAssignmentInput {
  assignmentId: string;
}

export interface WithdrawAssignment {
  execute(input: WithdrawAssignmentInput): Promise<void>;
}
