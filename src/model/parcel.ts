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
  status: {
    type: "String",
    default: 'Delivery'
  },
  updatedAt: {
    type: Date,
  },
  updatedBy: {
    type: "String",
  }
});

const Parcel = mongoose.model('Parcel', schema);

export default Parcel;