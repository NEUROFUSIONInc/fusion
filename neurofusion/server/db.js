import { Sequelize, Op, Model, DataTypes } from "sequelize";
const sequelize = new Sequelize("sqlite::memory:");

export class UserMetadata extends Model { }

UserMetadata.init(
    {
        userEmail: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        userGuid: {
            type: DataTypes.UUID,
            defaultValue: Sequelize.UUIDV4,
            allowNull: false,
            unique: true
        },
        neurosityToken: {
            type: DataTypes.TEXT,
        },
        magicflowToken: {
            type: DataTypes.TEXT,
        },
        magicflowLastFetched: {
            type: DataTypes.DATE,
        }
    }, { sequelize, modelName: "userMetadata" });

await sequelize.sync();

export default UserMetadata;