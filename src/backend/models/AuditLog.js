'use strict';
// models/AuditLog.js
// Immutable record of every privileged action in the system.
// Entries are written by route handlers at action time; never updated or deleted.
// actor_name / actor_role are denormalised so the record survives account deletion.

module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define(
    'AuditLog',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      // ── Who acted ────────────────────────────────────────────────────────
      actor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,   // null for automated / system actions
      },
      actor_name: {
        type: DataTypes.STRING(120),
        allowNull: false,
        defaultValue: 'System',
      },
      actor_role: {
        type: DataTypes.ENUM('admin', 'owner', 'system'),
        allowNull: false,
        defaultValue: 'system',
      },

      // ── What they did ────────────────────────────────────────────────────
      // approve | reject | remove | decline | delete-account | edit | flag | signin
      action: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },

      // ── What it affected ─────────────────────────────────────────────────
      target_type: {
        type: DataTypes.STRING(40),   // 'review' | 'restaurant' | 'user' | 'system'
        allowNull: true,
      },
      target_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      target_description: {
        type: DataTypes.STRING(255),  // e.g. 'Review "Best ramen in the city"'
        allowNull: true,
      },

      // ── Context ──────────────────────────────────────────────────────────
      meta: {
        type: DataTypes.STRING(120),  // short label — restaurant name, IP, etc.
        allowNull: true,
      },
      detail: {
        type: DataTypes.TEXT,         // full sentence describing the decision
        allowNull: true,
      },
    },
    {
      tableName:  'audit_log',
      modelName:  'AuditLog',
      // Audit entries are immutable — only created_at is meaningful.
      updatedAt: false,
    }
  );

  AuditLog.associate = (db) => {
    // Soft FK — actor may be deleted later; constraints: false keeps old entries intact.
    AuditLog.belongsTo(db.User, {
      foreignKey: 'actor_id',
      as: 'actorUser',
      constraints: false,
    });
  };

  return AuditLog;
};
