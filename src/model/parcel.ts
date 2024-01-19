import mongoose from "mongoose";

const Schema = mongoose.Schema;

const schema = new Schema({
  reference: {
    type: "String",
    require: true,
    unique: true

  },
  history: [
    {
      location: {
        type: "String",
        require: true,
      },
      date: {
        type: Date,
        require: true,
      },
    },
  ],
});

const Parcel = mongoose.model('Parcel', schema);

export {Parcel};