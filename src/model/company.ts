import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const schema = new Schema({
    name:{
        type: 'String',
        require: true
    },
    site:[{
        name: {
            type: 'String',
            require: true,
        },
        siteId: {
            type: 'String',
            unique: true,
        }
    }]
})

const Company = mongoose.model('Company', schema);

export { Company };
