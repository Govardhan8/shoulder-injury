import mongoose, { Schema, model, models } from 'mongoose';

export interface IPlayer {
  name: string;
  photoUrl: string;
  dateOfJoining: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const PlayerSchema = new Schema<IPlayer>(
  {
    name: {
      type: String,
      required: [true, 'Player name is required'],
      trim: true,
    },
    photoUrl: {
      type: String,
      required: [true, 'Photo URL is required'],
    },
    dateOfJoining: {
      type: Date,
      required: [true, 'Date of joining is required'],
    },
  },
  {
    timestamps: true,
  }
);

const Player = models.Player || model<IPlayer>('Player', PlayerSchema);

export default Player;
