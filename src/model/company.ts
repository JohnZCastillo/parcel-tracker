import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const schema = new Schema({
    name:{
        type: 'String',
        require: true
    },
    email: {
        type: 'String',
        unique: true,
    },
    password: {
        type: 'String',
    }
})

const Company = mongoose.model('Company', schema);

export { Company };
