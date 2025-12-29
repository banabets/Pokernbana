import { DataTypes, Model } from 'sequelize';
import sequelize from '../../src/database.js';

export interface RoomAttributes {
  id: string;
  name: string;
  hostId: string; // Usuario que creó la sala
  maxSeats: number;
  smallBlind: number;
  bigBlind: number;
  buyIn: number;
  status: 'waiting' | 'playing' | 'finished';
  hasBots: boolean;
  handNumber: number;
  createdAt?: Date;
  updatedAt?: Date;
  finishedAt?: Date;

  // Estadísticas de la sala
  totalHandsPlayed: number;
  totalPot: number;
  averagePot: number;
  duration?: number; // en minutos

  // Configuración de la sala
  allowSpectators: boolean;
  isPrivate: boolean;
  password?: string;
  gameMode: 'cash' | 'tournament';
}

export interface RoomCreationAttributes extends Omit<RoomAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Room extends Model<RoomAttributes, RoomCreationAttributes> implements RoomAttributes {
  public id!: string;
  public name!: string;
  public hostId!: string;
  public maxSeats!: number;
  public smallBlind!: number;
  public bigBlind!: number;
  public buyIn!: number;
  public status!: 'waiting' | 'playing' | 'finished';
  public hasBots!: boolean;
  public handNumber!: number;
  public createdAt?: Date;
  public updatedAt?: Date;
  public finishedAt?: Date;

  // Estadísticas
  public totalHandsPlayed!: number;
  public totalPot!: number;
  public averagePot!: number;
  public duration?: number;

  // Configuración
  public allowSpectators!: boolean;
  public isPrivate!: boolean;
  public password?: string;
  public gameMode!: 'cash' | 'tournament';

  // Métodos de instancia
  public async updateStats(handPot: number): Promise<void> {
    this.totalHandsPlayed += 1;
    this.totalPot += handPot;
    this.averagePot = this.totalPot / this.totalHandsPlayed;
    await this.save();
  }

  public async finishRoom(): Promise<void> {
    this.status = 'finished';
    this.finishedAt = new Date();
    if (this.createdAt) {
      this.duration = Math.floor((this.finishedAt.getTime() - this.createdAt.getTime()) / 60000);
    }
    await this.save();
  }

  public isFull(): boolean {
    // Este método necesitará ser implementado con la relación de seats
    // Por ahora retornamos false
    return false;
  }

  public canJoin(userId: string): boolean {
    // Lógica para verificar si un usuario puede unirse
    return this.status === 'waiting' || this.status === 'playing';
  }
}

Room.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [3, 100]
      }
    },
    hostId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    maxSeats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      validate: {
        min: 2,
        max: 10
      }
    },
    smallBlind: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 5,
      validate: {
        min: 1
      }
    },
    bigBlind: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 10,
      validate: {
        min: 1
      }
    },
    buyIn: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 2000,
      validate: {
        min: 0
      }
    },
    status: {
      type: DataTypes.ENUM('waiting', 'playing', 'finished'),
      allowNull: false,
      defaultValue: 'waiting'
    },
    hasBots: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    handNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    finishedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },

    // Estadísticas
    totalHandsPlayed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    totalPot: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    averagePot: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    // Configuración
    allowSpectators: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    password: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    gameMode: {
      type: DataTypes.ENUM('cash', 'tournament'),
      allowNull: false,
      defaultValue: 'cash'
    }
  },
  {
    sequelize,
    modelName: 'Room',
    tableName: 'rooms',
    indexes: [
      { fields: ['status'] },
      { fields: ['host_id'] },
      { fields: ['game_mode'] },
      { fields: ['created_at'] },
      { fields: ['has_bots'] }
    ]
  }
);

export default Room;
