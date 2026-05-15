import type { Task } from '@domain/ports/entities/task.entity.js';
import mongoose, { type Document, Schema } from 'mongoose';

type TaskDocument = Omit<Task, 'id'> & Document;

const taskSchema = new Schema<TaskDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    completed: { type: Boolean, default: false },
    userId: { type: String, required: true },
  },
  { timestamps: true },
);

taskSchema.index({ userId: 1, _id: 1 });

export const TaskModel = mongoose.model<TaskDocument>('Task', taskSchema);
