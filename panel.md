# Panel-Analyse & Vorschläge für alle Platformen

## Übersicht
Dieses Dokument analysiert die aktuellen Panel-Strukturen aller Platformen und macht Vorschläge für Verbesserungen basierend auf dem neuen Target-Management-System.

---

## 1. Email Platform

### Aktueller Stand
**Datei:** `backend/src/platforms/email/schema/panel.ts`

**Struktur:**
- **Tabs:** 2 Tabs (Empfänger, Gruppen)
- **Sections:**
  - `recipient-list`: Multiselect für Empfänger-Auswahl
  - `add-recipient`: Textfeld zum Hinzufügen neuer Emails
  - `group-management`: Gruppenname + komma-getrennte Emails

**Probleme:**
- ❌ Keine Custom Fields (Name, Geburtstag, etc.)
- ❌ Alte API-Endpoints (`/recipients` statt `/targets`)
- ❌ Keine Target-Liste mit Edit/Delete
- ❌ Gruppen verwenden Strings statt IDs
- ❌ Keine Personalisierungs-Felder

### Vorschlag 1: Minimal (Schnelle Migration)
**Fokus:** Migration auf neue Target-API, Custom Fields optional

```typescript
{
  tabs: [
    { id: 'targets', label: 'Empfänger', sections: ['target-list', 'add-target'] },
    { id: 'groups', label: 'Gruppen', sections: ['group-management'] }
  ],
  sections: [
    {
      id: 'target-list',
      title: 'Email-Empfänger',
      fields: [
        {
          name: 'targets',
          type: 'target-list', // NEU: Spezieller Field-Type
          label: 'Empfänger',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
            method: 'GET',
            responsePath: 'targets'
          }
        }
      ]
    },
    {
      id: 'add-target',
      title: 'Neue Email hinzufügen',
      fields: [
        {
          name: 'email',
          type: 'text',
          label: 'Email-Adresse',
          required: true,
          validation: [{ type: 'pattern', value: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' }],
          action: {
            endpoint: 'platforms/:platformId/targets',
            method: 'POST',
            trigger: 'submit'
          }
        }
      ]
    }
  ],
  targetSchema: {
    baseField: 'email',
    baseFieldLabel: 'Email-Adresse',
    customFields: [
      { name: 'name', type: 'text', label: 'Name' },
      { name: 'tags', type: 'multiselect', label: 'Tags' }
    ]
  }
}
```

**Vorteile:**
- ✅ Schnelle Migration
- ✅ Neue API-Endpoints
- ✅ Basis-Custom Fields
- ✅ Minimaler Aufwand

### Vorschlag 2: Standard (Empfohlen)
**Fokus:** Vollständige Target-Verwaltung mit Custom Fields

```typescript
{
  tabs: [
    { id: 'targets', label: 'Empfänger', sections: ['target-list', 'add-target', 'edit-target'] },
    { id: 'groups', label: 'Gruppen', sections: ['group-management'] },
    { id: 'personalization', label: 'Personalisierung', sections: ['personalization-settings'] }
  ],
  sections: [
    {
      id: 'target-list',
      title: 'Email-Empfänger',
      fields: [
        {
          name: 'targets',
          type: 'target-list',
          label: 'Empfänger',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
            method: 'GET'
          }
        }
      ]
    },
    {
      id: 'add-target',
      title: 'Neue Email hinzufügen',
      fields: [
        {
          name: 'email',
          type: 'text',
          label: 'Email-Adresse',
          required: true
        },
        {
          name: 'name',
          type: 'text',
          label: 'Name',
          required: false
        },
        {
          name: 'birthday',
          type: 'date',
          label: 'Geburtstag',
          required: false
        },
        {
          name: 'company',
          type: 'text',
          label: 'Firma',
          required: false
        },
        {
          name: 'tags',
          type: 'multiselect',
          label: 'Tags',
          required: false
        }
      ]
    },
    {
      id: 'edit-target',
      title: 'Empfänger bearbeiten',
      fields: [
        {
          name: 'selectedTarget',
          type: 'select',
          label: 'Empfänger auswählen',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
            method: 'GET',
            responsePath: 'options'
          }
        }
        // Dynamische Fields basierend auf targetSchema.customFields
      ]
    },
    {
      id: 'group-management',
      title: 'Email-Gruppen',
      fields: [
        {
          name: 'groupName',
          type: 'text',
          label: 'Gruppenname'
        },
        {
          name: 'groupTargets',
          type: 'multiselect',
          label: 'Empfänger auswählen',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
            method: 'GET',
            responsePath: 'options'
          }
        }
      ]
    },
    {
      id: 'personalization-settings',
      title: 'Personalisierungs-Einstellungen',
      fields: [
        {
          name: 'usePersonalization',
          type: 'boolean',
          label: 'Personalisierung aktivieren',
          default: false
        },
        {
          name: 'personalizationFields',
          type: 'multiselect',
          label: 'Zu verwendende Felder',
          options: [
            { label: 'Name', value: 'name' },
            { label: 'Geburtstag', value: 'birthday' },
            { label: 'Firma', value: 'company' }
          ],
          visibleWhen: {
            field: 'usePersonalization',
            operator: 'equals',
            value: true
          }
        }
      ]
    }
  ],
  targetSchema: {
    baseField: 'email',
    baseFieldLabel: 'Email-Adresse',
    customFields: [
      { name: 'name', type: 'text', label: 'Name' },
      { name: 'birthday', type: 'date', label: 'Geburtstag' },
      { name: 'company', type: 'text', label: 'Firma' },
      { name: 'phone', type: 'text', label: 'Telefon' },
      { name: 'tags', type: 'multiselect', label: 'Tags' }
    ],
    supportsGroups: true
  }
}
```

**Vorteile:**
- ✅ Vollständige CRUD-Operationen
- ✅ Alle Custom Fields
- ✅ Personalisierungs-Settings
- ✅ Gruppen mit Target-IDs
- ✅ Edit-Funktionalität

### Vorschlag 3: Advanced (Maximale Features)
**Fokus:** Erweiterte Features wie Import/Export, Bulk-Actions, Analytics

```typescript
{
  tabs: [
    { id: 'targets', label: 'Empfänger', sections: ['target-list', 'add-target', 'edit-target', 'bulk-actions'] },
    { id: 'groups', label: 'Gruppen', sections: ['group-management', 'group-analytics'] },
    { id: 'personalization', label: 'Personalisierung', sections: ['personalization-settings', 'template-variables'] },
    { id: 'import-export', label: 'Import/Export', sections: ['import', 'export'] }
  ],
  sections: [
    // ... alle aus Vorschlag 2 ...
    {
      id: 'bulk-actions',
      title: 'Bulk-Aktionen',
      fields: [
        {
          name: 'selectedTargets',
          type: 'multiselect',
          label: 'Empfänger auswählen',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
            method: 'GET',
            responsePath: 'options'
          }
        },
        {
          name: 'bulkAction',
          type: 'select',
          label: 'Aktion',
          options: [
            { label: 'Tags hinzufügen', value: 'addTags' },
            { label: 'Tags entfernen', value: 'removeTags' },
            { label: 'Zu Gruppe hinzufügen', value: 'addToGroup' },
            { label: 'Löschen', value: 'delete' }
          ]
        }
      ]
    },
    {
      id: 'group-analytics',
      title: 'Gruppen-Analytics',
      fields: [
        {
          name: 'selectedGroup',
          type: 'select',
          label: 'Gruppe auswählen',
          optionsSource: {
            endpoint: 'platforms/:platformId/target-groups',
            method: 'GET',
            responsePath: 'groups'
          }
        }
        // Analytics-Display (read-only)
      ]
    },
    {
      id: 'import',
      title: 'Empfänger importieren',
      fields: [
        {
          name: 'importFile',
          type: 'file',
          label: 'CSV/JSON Datei',
          required: true
        },
        {
          name: 'importMapping',
          type: 'json',
          label: 'Feld-Mapping',
          default: { email: 'email', name: 'name', ... }
        }
      ]
    },
    {
      id: 'export',
      title: 'Empfänger exportieren',
      fields: [
        {
          name: 'exportFormat',
          type: 'select',
          label: 'Format',
          options: [
            { label: 'CSV', value: 'csv' },
            { label: 'JSON', value: 'json' },
            { label: 'Excel', value: 'xlsx' }
          ]
        },
        {
          name: 'exportFields',
          type: 'multiselect',
          label: 'Felder exportieren',
          options: [
            { label: 'Email', value: 'email' },
            { label: 'Name', value: 'name' },
            { label: 'Geburtstag', value: 'birthday' },
            { label: 'Firma', value: 'company' },
            { label: 'Tags', value: 'tags' }
          ]
        }
      ]
    }
  ],
  targetSchema: {
    // ... wie Vorschlag 2 ...
  }
}
```

**Vorteile:**
- ✅ Alle Features aus Vorschlag 2
- ✅ Bulk-Actions
- ✅ Import/Export
- ✅ Analytics
- ✅ Erweiterte Personalisierung

---

## 2. Reddit Platform

### Aktueller Stand
**Datei:** `backend/src/platforms/reddit/schema/panel.ts`

**Struktur:**
- **Tabs:** 2 Tabs (Subreddits, Gruppen)
- **Sections:**
  - `subreddit-list`: Multiselect für Subreddit-Auswahl
  - `add-subreddit`: Textfeld zum Hinzufügen neuer Subreddits
  - `group-management`: Gruppenname + komma-getrennte Subreddits

**Probleme:**
- ❌ Keine Custom Fields (Description, Tags, Active-Status)
- ❌ Alte API-Endpoints (`/subreddits` statt `/targets`)
- ❌ Keine Target-Liste mit Edit/Delete
- ❌ Gruppen verwenden Strings statt IDs

### Vorschlag 1: Minimal (Schnelle Migration)
**Fokus:** Migration auf neue Target-API, Basis-Custom Fields

```typescript
{
  tabs: [
    { id: 'targets', label: 'Subreddits', sections: ['target-list', 'add-target'] },
    { id: 'groups', label: 'Gruppen', sections: ['group-management'] }
  ],
  sections: [
    {
      id: 'target-list',
      title: 'Subreddits',
      fields: [
        {
          name: 'targets',
          type: 'target-list',
          label: 'Subreddits',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
            method: 'GET'
          }
        }
      ]
    },
    {
      id: 'add-target',
      title: 'Neues Subreddit hinzufügen',
      fields: [
        {
          name: 'subreddit',
          type: 'text',
          label: 'Subreddit Name',
          required: true,
          validation: [{ type: 'pattern', value: '^[a-z0-9_]{3,21}$' }],
          action: {
            endpoint: 'platforms/:platformId/targets',
            method: 'POST',
            trigger: 'submit'
          }
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Beschreibung',
          required: false
        }
      ]
    }
  ],
  targetSchema: {
    baseField: 'subreddit',
    baseFieldLabel: 'Subreddit Name',
    customFields: [
      { name: 'description', type: 'textarea', label: 'Beschreibung' },
      { name: 'active', type: 'boolean', label: 'Aktiv', default: true }
    ]
  }
}
```

### Vorschlag 2: Standard (Empfohlen)
**Fokus:** Vollständige Verwaltung mit allen Custom Fields

```typescript
{
  tabs: [
    { id: 'targets', label: 'Subreddits', sections: ['target-list', 'add-target', 'edit-target'] },
    { id: 'groups', label: 'Gruppen', sections: ['group-management'] },
    { id: 'analytics', label: 'Analytics', sections: ['subreddit-stats'] }
  ],
  sections: [
    {
      id: 'target-list',
      title: 'Subreddits',
      fields: [
        {
          name: 'targets',
          type: 'target-list',
          label: 'Subreddits',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
            method: 'GET'
          }
        }
      ]
    },
    {
      id: 'add-target',
      title: 'Neues Subreddit hinzufügen',
      fields: [
        {
          name: 'subreddit',
          type: 'text',
          label: 'Subreddit Name',
          required: true,
          placeholder: 'z.B. electronicmusic',
          validation: [{ type: 'pattern', value: '^[a-z0-9_]{3,21}$' }]
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Beschreibung',
          required: false,
          validation: [{ type: 'maxLength', value: 500 }]
        },
        {
          name: 'tags',
          type: 'multiselect',
          label: 'Tags',
          required: false,
          options: [
            { label: 'Music', value: 'music' },
            { label: 'Events', value: 'events' },
            { label: 'Local', value: 'local' }
          ]
        },
        {
          name: 'active',
          type: 'boolean',
          label: 'Aktiv',
          default: true
        }
      ]
    },
    {
      id: 'edit-target',
      title: 'Subreddit bearbeiten',
      fields: [
        {
          name: 'selectedTarget',
          type: 'select',
          label: 'Subreddit auswählen',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
            method: 'GET',
            responsePath: 'options'
          }
        }
        // Dynamische Fields basierend auf targetSchema
      ]
    },
    {
      id: 'group-management',
      title: 'Subreddit-Gruppen',
      fields: [
        {
          name: 'groupName',
          type: 'text',
          label: 'Gruppenname'
        },
        {
          name: 'groupTargets',
          type: 'multiselect',
          label: 'Subreddits auswählen',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
            method: 'GET',
            responsePath: 'options'
          }
        }
      ]
    },
    {
      id: 'subreddit-stats',
      title: 'Subreddit-Statistiken',
      fields: [
        {
          name: 'selectedTarget',
          type: 'select',
          label: 'Subreddit auswählen',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
            method: 'GET',
            responsePath: 'options'
          }
        }
        // Read-only Stats Display
      ]
    }
  ],
  targetSchema: {
    baseField: 'subreddit',
    baseFieldLabel: 'Subreddit Name',
    customFields: [
      { name: 'description', type: 'textarea', label: 'Beschreibung' },
      { name: 'tags', type: 'multiselect', label: 'Tags' },
      { name: 'active', type: 'boolean', label: 'Aktiv', default: true }
    ],
    supportsGroups: true
  }
}
```

### Vorschlag 3: Advanced (Maximale Features)
**Fokus:** Erweiterte Features wie Posting-History, Engagement-Tracking

```typescript
{
  tabs: [
    { id: 'targets', label: 'Subreddits', sections: ['target-list', 'add-target', 'edit-target'] },
    { id: 'groups', label: 'Gruppen', sections: ['group-management'] },
    { id: 'analytics', label: 'Analytics', sections: ['subreddit-stats', 'posting-history', 'engagement'] },
    { id: 'scheduling', label: 'Zeitplanung', sections: ['post-schedule'] }
  ],
  sections: [
    // ... alle aus Vorschlag 2 ...
    {
      id: 'posting-history',
      title: 'Posting-Historie',
      fields: [
        {
          name: 'selectedTarget',
          type: 'select',
          label: 'Subreddit auswählen',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
            method: 'GET',
            responsePath: 'options'
          }
        }
        // Read-only History Display
      ]
    },
    {
      id: 'engagement',
      title: 'Engagement-Tracking',
      fields: [
        {
          name: 'selectedTarget',
          type: 'select',
          label: 'Subreddit auswählen',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
            method: 'GET',
            responsePath: 'options'
          }
        }
        // Read-only Engagement Metrics
      ]
    },
    {
      id: 'post-schedule',
      title: 'Post-Zeitplanung',
      fields: [
        {
          name: 'selectedTarget',
          type: 'select',
          label: 'Subreddit auswählen',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
            method: 'GET',
            responsePath: 'options'
          }
        },
        {
          name: 'optimalPostingTime',
          type: 'time',
          label: 'Optimaler Posting-Zeitpunkt',
          description: 'Basierend auf Engagement-Daten'
        }
      ]
    }
  ],
  targetSchema: {
    // ... wie Vorschlag 2 ...
  }
}
```

---

## 3. Twitter Platform

### Aktueller Stand
**Kein Panel-Schema vorhanden**

**Metadata:**
- `dataSource: 'accounts.json'` → Vermutlich Twitter-Accounts/Profiles

**Mögliche Targets:**
- Twitter-Accounts (für Multi-Account-Posting)
- Hashtags (für Hashtag-Tracking)
- Mentions/User (für User-Interaktionen)

### Vorschlag 1: Minimal (Account-Management)
**Fokus:** Basis-Account-Verwaltung

```typescript
{
  tabs: [
    { id: 'accounts', label: 'Accounts', sections: ['account-list', 'add-account'] }
  ],
  sections: [
    {
      id: 'account-list',
      title: 'Twitter-Accounts',
      fields: [
        {
          name: 'accounts',
          type: 'target-list',
          label: 'Accounts',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
            method: 'GET'
          }
        }
      ]
    },
    {
      id: 'add-account',
      title: 'Neuen Account hinzufügen',
      fields: [
        {
          name: 'username',
          type: 'text',
          label: 'Twitter Username',
          required: true,
          validation: [{ type: 'pattern', value: '^@?[a-zA-Z0-9_]{1,15}$' }]
        },
        {
          name: 'displayName',
          type: 'text',
          label: 'Anzeigename',
          required: false
        }
      ]
    }
  ],
  targetSchema: {
    baseField: 'username',
    baseFieldLabel: 'Twitter Username',
    customFields: [
      { name: 'displayName', type: 'text', label: 'Anzeigename' },
      { name: 'active', type: 'boolean', label: 'Aktiv', default: true }
    ]
  }
}
```

### Vorschlag 2: Standard (Account + Hashtag-Management)
**Fokus:** Accounts + Hashtag-Tracking

```typescript
{
  tabs: [
    { id: 'accounts', label: 'Accounts', sections: ['account-list', 'add-account', 'edit-account'] },
    { id: 'hashtags', label: 'Hashtags', sections: ['hashtag-list', 'add-hashtag'] },
    { id: 'mentions', label: 'Mentions', sections: ['mention-list', 'add-mention'] }
  ],
  sections: [
    {
      id: 'account-list',
      title: 'Twitter-Accounts',
      fields: [
        {
          name: 'accounts',
          type: 'target-list',
          label: 'Accounts',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=account',
            method: 'GET'
          }
        }
      ]
    },
    {
      id: 'add-account',
      title: 'Neuen Account hinzufügen',
      fields: [
        {
          name: 'username',
          type: 'text',
          label: 'Twitter Username',
          required: true,
          placeholder: '@username oder username'
        },
        {
          name: 'displayName',
          type: 'text',
          label: 'Anzeigename'
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Beschreibung'
        },
        {
          name: 'active',
          type: 'boolean',
          label: 'Aktiv',
          default: true
        }
      ]
    },
    {
      id: 'hashtag-list',
      title: 'Hashtags',
      fields: [
        {
          name: 'hashtags',
          type: 'target-list',
          label: 'Hashtags',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=hashtag',
            method: 'GET'
          }
        }
      ]
    },
    {
      id: 'add-hashtag',
      title: 'Neuen Hashtag hinzufügen',
      fields: [
        {
          name: 'hashtag',
          type: 'text',
          label: 'Hashtag',
          required: true,
          placeholder: '#hashtag oder hashtag',
          validation: [{ type: 'pattern', value: '^#?[a-zA-Z0-9_]+$' }]
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Beschreibung'
        }
      ]
    }
  ],
  targetSchema: {
    baseField: 'username', // Oder 'hashtag' für Hashtags
    baseFieldLabel: 'Twitter Username',
    customFields: [
      { name: 'displayName', type: 'text', label: 'Anzeigename' },
      { name: 'description', type: 'textarea', label: 'Beschreibung' },
      { name: 'active', type: 'boolean', label: 'Aktiv', default: true }
    ]
  }
}
```

### Vorschlag 3: Advanced (Account + Analytics + Engagement)
**Fokus:** Erweiterte Features mit Analytics und Engagement-Tracking

```typescript
{
  tabs: [
    { id: 'accounts', label: 'Accounts', sections: ['account-list', 'add-account', 'edit-account'] },
    { id: 'hashtags', label: 'Hashtags', sections: ['hashtag-list', 'add-hashtag'] },
    { id: 'analytics', label: 'Analytics', sections: ['account-stats', 'hashtag-performance'] },
    { id: 'engagement', label: 'Engagement', sections: ['engagement-tracking'] }
  ],
  sections: [
    // ... alle aus Vorschlag 2 ...
    {
      id: 'account-stats',
      title: 'Account-Statistiken',
      fields: [
        {
          name: 'selectedAccount',
          type: 'select',
          label: 'Account auswählen',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=account',
            method: 'GET',
            responsePath: 'options'
          }
        }
        // Read-only Stats Display
      ]
    },
    {
      id: 'hashtag-performance',
      title: 'Hashtag-Performance',
      fields: [
        {
          name: 'selectedHashtag',
          type: 'select',
          label: 'Hashtag auswählen',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=hashtag',
            method: 'GET',
            responsePath: 'options'
          }
        }
        // Read-only Performance Metrics
      ]
    },
    {
      id: 'engagement-tracking',
      title: 'Engagement-Tracking',
      fields: [
        {
          name: 'trackEngagement',
          type: 'boolean',
          label: 'Engagement-Tracking aktivieren',
          default: false
        },
        {
          name: 'engagementMetrics',
          type: 'multiselect',
          label: 'Zu trackende Metriken',
          options: [
            { label: 'Likes', value: 'likes' },
            { label: 'Retweets', value: 'retweets' },
            { label: 'Replies', value: 'replies' },
            { label: 'Impressions', value: 'impressions' }
          ],
          visibleWhen: {
            field: 'trackEngagement',
            operator: 'equals',
            value: true
          }
        }
      ]
    }
  ],
  targetSchema: {
    // ... wie Vorschlag 2 ...
  }
}
```

---

## 4. LinkedIn Platform

### Aktueller Stand
**Kein Panel-Schema vorhanden**

**Metadata:**
- `dataSource: 'connections.json'` → Vermutlich LinkedIn-Connections/Profiles

**Mögliche Targets:**
- LinkedIn-Connections (für Personalisierung)
- Company Pages (für Multi-Page-Posting)
- Groups (für Group-Posting)

### Vorschlag 1: Minimal (Connection-Management)
**Fokus:** Basis-Connection-Verwaltung

```typescript
{
  tabs: [
    { id: 'connections', label: 'Connections', sections: ['connection-list', 'add-connection'] }
  ],
  sections: [
    {
      id: 'connection-list',
      title: 'LinkedIn-Connections',
      fields: [
        {
          name: 'connections',
          type: 'target-list',
          label: 'Connections',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
            method: 'GET'
          }
        }
      ]
    },
    {
      id: 'add-connection',
      title: 'Neue Connection hinzufügen',
      fields: [
        {
          name: 'profileUrl',
          type: 'url',
          label: 'LinkedIn Profile URL',
          required: true,
          placeholder: 'https://linkedin.com/in/username'
        },
        {
          name: 'name',
          type: 'text',
          label: 'Name',
          required: false
        },
        {
          name: 'company',
          type: 'text',
          label: 'Firma',
          required: false
        }
      ]
    }
  ],
  targetSchema: {
    baseField: 'profileUrl',
    baseFieldLabel: 'LinkedIn Profile URL',
    customFields: [
      { name: 'name', type: 'text', label: 'Name' },
      { name: 'company', type: 'text', label: 'Firma' },
      { name: 'title', type: 'text', label: 'Job-Titel' }
    ]
  }
}
```

### Vorschlag 2: Standard (Connections + Company Pages)
**Fokus:** Connections + Company Pages Management

```typescript
{
  tabs: [
    { id: 'connections', label: 'Connections', sections: ['connection-list', 'add-connection', 'edit-connection'] },
    { id: 'pages', label: 'Company Pages', sections: ['page-list', 'add-page'] },
    { id: 'groups', label: 'Groups', sections: ['group-list', 'add-group'] }
  ],
  sections: [
    {
      id: 'connection-list',
      title: 'LinkedIn-Connections',
      fields: [
        {
          name: 'connections',
          type: 'target-list',
          label: 'Connections',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=connection',
            method: 'GET'
          }
        }
      ]
    },
    {
      id: 'add-connection',
      title: 'Neue Connection hinzufügen',
      fields: [
        {
          name: 'profileUrl',
          type: 'url',
          label: 'LinkedIn Profile URL',
          required: true
        },
        {
          name: 'name',
          type: 'text',
          label: 'Name',
          required: true
        },
        {
          name: 'company',
          type: 'text',
          label: 'Firma'
        },
        {
          name: 'title',
          type: 'text',
          label: 'Job-Titel'
        },
        {
          name: 'tags',
          type: 'multiselect',
          label: 'Tags'
        }
      ]
    },
    {
      id: 'page-list',
      title: 'Company Pages',
      fields: [
        {
          name: 'pages',
          type: 'target-list',
          label: 'Company Pages',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=page',
            method: 'GET'
          }
        }
      ]
    },
    {
      id: 'add-page',
      title: 'Neue Company Page hinzufügen',
      fields: [
        {
          name: 'pageUrl',
          type: 'url',
          label: 'Company Page URL',
          required: true
        },
        {
          name: 'pageName',
          type: 'text',
          label: 'Page Name',
          required: true
        },
        {
          name: 'active',
          type: 'boolean',
          label: 'Aktiv',
          default: true
        }
      ]
    }
  ],
  targetSchema: {
    baseField: 'profileUrl', // Oder 'pageUrl' für Pages
    baseFieldLabel: 'LinkedIn Profile URL',
    customFields: [
      { name: 'name', type: 'text', label: 'Name' },
      { name: 'company', type: 'text', label: 'Firma' },
      { name: 'title', type: 'text', label: 'Job-Titel' },
      { name: 'tags', type: 'multiselect', label: 'Tags' }
    ]
  }
}
```

### Vorschlag 3: Advanced (Connections + Pages + Analytics + Personalization)
**Fokus:** Erweiterte Features mit Analytics und Personalisierung

```typescript
{
  tabs: [
    { id: 'connections', label: 'Connections', sections: ['connection-list', 'add-connection', 'edit-connection'] },
    { id: 'pages', label: 'Company Pages', sections: ['page-list', 'add-page'] },
    { id: 'groups', label: 'Groups', sections: ['group-list', 'add-group'] },
    { id: 'analytics', label: 'Analytics', sections: ['connection-insights', 'page-analytics'] },
    { id: 'personalization', label: 'Personalisierung', sections: ['personalization-settings'] }
  ],
  sections: [
    // ... alle aus Vorschlag 2 ...
    {
      id: 'connection-insights',
      title: 'Connection-Insights',
      fields: [
        {
          name: 'selectedConnection',
          type: 'select',
          label: 'Connection auswählen',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=connection',
            method: 'GET',
            responsePath: 'options'
          }
        }
        // Read-only Insights Display
      ]
    },
    {
      id: 'page-analytics',
      title: 'Page-Analytics',
      fields: [
        {
          name: 'selectedPage',
          type: 'select',
          label: 'Company Page auswählen',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=page',
            method: 'GET',
            responsePath: 'options'
          }
        }
        // Read-only Analytics Display
      ]
    },
    {
      id: 'personalization-settings',
      title: 'Personalisierungs-Einstellungen',
      fields: [
        {
          name: 'usePersonalization',
          type: 'boolean',
          label: 'Personalisierung aktivieren',
          default: false
        },
        {
          name: 'personalizationFields',
          type: 'multiselect',
          label: 'Zu verwendende Felder',
          options: [
            { label: 'Name', value: 'name' },
            { label: 'Firma', value: 'company' },
            { label: 'Job-Titel', value: 'title' }
          ],
          visibleWhen: {
            field: 'usePersonalization',
            operator: 'equals',
            value: true
          }
        }
      ]
    }
  ],
  targetSchema: {
    // ... wie Vorschlag 2 ...
  }
}
```

---

## 5. Instagram Platform

### Aktueller Stand
**Kein Panel-Schema vorhanden**

**Metadata:**
- `dataSource: 'accounts.json'` → Vermutlich Instagram-Accounts

**Mögliche Targets:**
- Instagram-Accounts (für Multi-Account-Posting)
- Hashtags (für Hashtag-Tracking)
- Locations (für Location-Tagging)

### Vorschlag 1: Minimal (Account-Management)
**Fokus:** Basis-Account-Verwaltung

```typescript
{
  tabs: [
    { id: 'accounts', label: 'Accounts', sections: ['account-list', 'add-account'] }
  ],
  sections: [
    {
      id: 'account-list',
      title: 'Instagram-Accounts',
      fields: [
        {
          name: 'accounts',
          type: 'target-list',
          label: 'Accounts',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
            method: 'GET'
          }
        }
      ]
    },
    {
      id: 'add-account',
      title: 'Neuen Account hinzufügen',
      fields: [
        {
          name: 'username',
          type: 'text',
          label: 'Instagram Username',
          required: true,
          placeholder: '@username oder username',
          validation: [{ type: 'pattern', value: '^@?[a-zA-Z0-9_.]+$' }]
        },
        {
          name: 'displayName',
          type: 'text',
          label: 'Anzeigename'
        }
      ]
    }
  ],
  targetSchema: {
    baseField: 'username',
    baseFieldLabel: 'Instagram Username',
    customFields: [
      { name: 'displayName', type: 'text', label: 'Anzeigename' },
      { name: 'active', type: 'boolean', label: 'Aktiv', default: true }
    ]
  }
}
```

### Vorschlag 2: Standard (Account + Hashtag + Location)
**Fokus:** Accounts + Hashtag + Location Management

```typescript
{
  tabs: [
    { id: 'accounts', label: 'Accounts', sections: ['account-list', 'add-account', 'edit-account'] },
    { id: 'hashtags', label: 'Hashtags', sections: ['hashtag-list', 'add-hashtag'] },
    { id: 'locations', label: 'Locations', sections: ['location-list', 'add-location'] }
  ],
  sections: [
    {
      id: 'account-list',
      title: 'Instagram-Accounts',
      fields: [
        {
          name: 'accounts',
          type: 'target-list',
          label: 'Accounts',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=account',
            method: 'GET'
          }
        }
      ]
    },
    {
      id: 'add-account',
      title: 'Neuen Account hinzufügen',
      fields: [
        {
          name: 'username',
          type: 'text',
          label: 'Instagram Username',
          required: true
        },
        {
          name: 'displayName',
          type: 'text',
          label: 'Anzeigename'
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Beschreibung'
        },
        {
          name: 'active',
          type: 'boolean',
          label: 'Aktiv',
          default: true
        }
      ]
    },
    {
      id: 'hashtag-list',
      title: 'Hashtags',
      fields: [
        {
          name: 'hashtags',
          type: 'target-list',
          label: 'Hashtags',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=hashtag',
            method: 'GET'
          }
        }
      ]
    },
    {
      id: 'add-hashtag',
      title: 'Neuen Hashtag hinzufügen',
      fields: [
        {
          name: 'hashtag',
          type: 'text',
          label: 'Hashtag',
          required: true,
          placeholder: '#hashtag oder hashtag',
          validation: [{ type: 'pattern', value: '^#?[a-zA-Z0-9_]+$' }]
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Beschreibung'
        }
      ]
    },
    {
      id: 'location-list',
      title: 'Locations',
      fields: [
        {
          name: 'locations',
          type: 'target-list',
          label: 'Locations',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=location',
            method: 'GET'
          }
        }
      ]
    },
    {
      id: 'add-location',
      title: 'Neue Location hinzufügen',
      fields: [
        {
          name: 'locationName',
          type: 'text',
          label: 'Location Name',
          required: true
        },
        {
          name: 'locationId',
          type: 'text',
          label: 'Instagram Location ID',
          required: false
        },
        {
          name: 'address',
          type: 'textarea',
          label: 'Adresse'
        }
      ]
    }
  ],
  targetSchema: {
    baseField: 'username', // Oder 'hashtag' / 'locationName'
    baseFieldLabel: 'Instagram Username',
    customFields: [
      { name: 'displayName', type: 'text', label: 'Anzeigename' },
      { name: 'description', type: 'textarea', label: 'Beschreibung' },
      { name: 'active', type: 'boolean', label: 'Aktiv', default: true }
    ]
  }
}
```

### Vorschlag 3: Advanced (Account + Analytics + Engagement + Stories)
**Fokus:** Erweiterte Features mit Analytics, Engagement und Stories-Support

```typescript
{
  tabs: [
    { id: 'accounts', label: 'Accounts', sections: ['account-list', 'add-account', 'edit-account'] },
    { id: 'hashtags', label: 'Hashtags', sections: ['hashtag-list', 'add-hashtag'] },
    { id: 'locations', label: 'Locations', sections: ['location-list', 'add-location'] },
    { id: 'analytics', label: 'Analytics', sections: ['account-insights', 'hashtag-performance'] },
    { id: 'stories', label: 'Stories', sections: ['story-settings'] }
  ],
  sections: [
    // ... alle aus Vorschlag 2 ...
    {
      id: 'account-insights',
      title: 'Account-Insights',
      fields: [
        {
          name: 'selectedAccount',
          type: 'select',
          label: 'Account auswählen',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=account',
            method: 'GET',
            responsePath: 'options'
          }
        }
        // Read-only Insights Display
      ]
    },
    {
      id: 'hashtag-performance',
      title: 'Hashtag-Performance',
      fields: [
        {
          name: 'selectedHashtag',
          type: 'select',
          label: 'Hashtag auswählen',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=hashtag',
            method: 'GET',
            responsePath: 'options'
          }
        }
        // Read-only Performance Metrics
      ]
    },
    {
      id: 'story-settings',
      title: 'Story-Einstellungen',
      fields: [
        {
          name: 'enableStories',
          type: 'boolean',
          label: 'Stories aktivieren',
          default: false
        },
        {
          name: 'storyAccounts',
          type: 'multiselect',
          label: 'Accounts für Stories',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=account',
            method: 'GET',
            responsePath: 'options'
          },
          visibleWhen: {
            field: 'enableStories',
            operator: 'equals',
            value: true
          }
        }
      ]
    }
  ],
  targetSchema: {
    // ... wie Vorschlag 2 ...
  }
}
```

---

## 6. Facebook Platform

### Aktueller Stand
**Kein Panel-Schema vorhanden**

**Metadata:**
- `dataSource: 'pages.json'` → Vermutlich Facebook-Pages

**Mögliche Targets:**
- Facebook-Pages (für Multi-Page-Posting)
- Groups (für Group-Posting)
- Events (für Event-Posting)

### Vorschlag 1: Minimal (Page-Management)
**Fokus:** Basis-Page-Verwaltung

```typescript
{
  tabs: [
    { id: 'pages', label: 'Pages', sections: ['page-list', 'add-page'] }
  ],
  sections: [
    {
      id: 'page-list',
      title: 'Facebook-Pages',
      fields: [
        {
          name: 'pages',
          type: 'target-list',
          label: 'Pages',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets',
            method: 'GET'
          }
        }
      ]
    },
    {
      id: 'add-page',
      title: 'Neue Page hinzufügen',
      fields: [
        {
          name: 'pageId',
          type: 'text',
          label: 'Facebook Page ID',
          required: true
        },
        {
          name: 'pageName',
          type: 'text',
          label: 'Page Name',
          required: true
        }
      ]
    }
  ],
  targetSchema: {
    baseField: 'pageId',
    baseFieldLabel: 'Facebook Page ID',
    customFields: [
      { name: 'pageName', type: 'text', label: 'Page Name' },
      { name: 'active', type: 'boolean', label: 'Aktiv', default: true }
    ]
  }
}
```

### Vorschlag 2: Standard (Pages + Groups + Events)
**Fokus:** Pages + Groups + Events Management

```typescript
{
  tabs: [
    { id: 'pages', label: 'Pages', sections: ['page-list', 'add-page', 'edit-page'] },
    { id: 'groups', label: 'Groups', sections: ['group-list', 'add-group'] },
    { id: 'events', label: 'Events', sections: ['event-list', 'add-event'] }
  ],
  sections: [
    {
      id: 'page-list',
      title: 'Facebook-Pages',
      fields: [
        {
          name: 'pages',
          type: 'target-list',
          label: 'Pages',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=page',
            method: 'GET'
          }
        }
      ]
    },
    {
      id: 'add-page',
      title: 'Neue Page hinzufügen',
      fields: [
        {
          name: 'pageId',
          type: 'text',
          label: 'Facebook Page ID',
          required: true
        },
        {
          name: 'pageName',
          type: 'text',
          label: 'Page Name',
          required: true
        },
        {
          name: 'pageUrl',
          type: 'url',
          label: 'Page URL'
        },
        {
          name: 'category',
          type: 'select',
          label: 'Kategorie',
          options: [
            { label: 'Business', value: 'business' },
            { label: 'Entertainment', value: 'entertainment' },
            { label: 'Event', value: 'event' }
          ]
        },
        {
          name: 'active',
          type: 'boolean',
          label: 'Aktiv',
          default: true
        }
      ]
    },
    {
      id: 'group-list',
      title: 'Facebook-Groups',
      fields: [
        {
          name: 'groups',
          type: 'target-list',
          label: 'Groups',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=group',
            method: 'GET'
          }
        }
      ]
    },
    {
      id: 'add-group',
      title: 'Neue Group hinzufügen',
      fields: [
        {
          name: 'groupId',
          type: 'text',
          label: 'Facebook Group ID',
          required: true
        },
        {
          name: 'groupName',
          type: 'text',
          label: 'Group Name',
          required: true
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Beschreibung'
        }
      ]
    }
  ],
  targetSchema: {
    baseField: 'pageId', // Oder 'groupId' / 'eventId'
    baseFieldLabel: 'Facebook Page ID',
    customFields: [
      { name: 'pageName', type: 'text', label: 'Page Name' },
      { name: 'pageUrl', type: 'url', label: 'Page URL' },
      { name: 'category', type: 'select', label: 'Kategorie' },
      { name: 'active', type: 'boolean', label: 'Aktiv', default: true }
    ]
  }
}
```

### Vorschlag 3: Advanced (Pages + Analytics + Scheduling + Insights)
**Fokus:** Erweiterte Features mit Analytics, Scheduling und Insights

```typescript
{
  tabs: [
    { id: 'pages', label: 'Pages', sections: ['page-list', 'add-page', 'edit-page'] },
    { id: 'groups', label: 'Groups', sections: ['group-list', 'add-group'] },
    { id: 'events', label: 'Events', sections: ['event-list', 'add-event'] },
    { id: 'analytics', label: 'Analytics', sections: ['page-insights', 'post-performance'] },
    { id: 'scheduling', label: 'Zeitplanung', sections: ['post-schedule', 'optimal-timing'] }
  ],
  sections: [
    // ... alle aus Vorschlag 2 ...
    {
      id: 'page-insights',
      title: 'Page-Insights',
      fields: [
        {
          name: 'selectedPage',
          type: 'select',
          label: 'Page auswählen',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=page',
            method: 'GET',
            responsePath: 'options'
          }
        }
        // Read-only Insights Display
      ]
    },
    {
      id: 'post-performance',
      title: 'Post-Performance',
      fields: [
        {
          name: 'selectedPage',
          type: 'select',
          label: 'Page auswählen',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=page',
            method: 'GET',
            responsePath: 'options'
          }
        }
        // Read-only Performance Metrics
      ]
    },
    {
      id: 'post-schedule',
      title: 'Post-Zeitplanung',
      fields: [
        {
          name: 'selectedPage',
          type: 'select',
          label: 'Page auswählen',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=page',
            method: 'GET',
            responsePath: 'options'
          }
        },
        {
          name: 'scheduledPosts',
          type: 'json',
          label: 'Geplante Posts',
          description: 'Read-only: Liste der geplanten Posts'
        }
      ]
    },
    {
      id: 'optimal-timing',
      title: 'Optimaler Posting-Zeitpunkt',
      fields: [
        {
          name: 'selectedPage',
          type: 'select',
          label: 'Page auswählen',
          optionsSource: {
            endpoint: 'platforms/:platformId/targets?type=page',
            method: 'GET',
            responsePath: 'options'
          }
        },
        {
          name: 'optimalPostingTime',
          type: 'time',
          label: 'Optimaler Posting-Zeitpunkt',
          description: 'Basierend auf Engagement-Daten'
        }
      ]
    }
  ],
  targetSchema: {
    // ... wie Vorschlag 2 ...
  }
}
```

---

## Zusammenfassung & Empfehlungen

### Gemeinsame Patterns
Alle Platformen sollten folgende gemeinsame Features haben:
1. **Target-Liste** mit `target-list` Field-Type
2. **Add-Target** Section mit Base Field + Custom Fields
3. **Edit-Target** Section für Bearbeitung
4. **Group-Management** mit Target-IDs statt Strings
5. **targetSchema** Definition im Panel-Schema

### Migrations-Priorität
1. **Email** (höchste Priorität) - bereits Panel vorhanden, Migration auf neue API
2. **Reddit** (hohe Priorität) - bereits Panel vorhanden, Migration auf neue API
3. **Twitter** (mittlere Priorität) - Panel fehlt, neu erstellen
4. **LinkedIn** (mittlere Priorität) - Panel fehlt, neu erstellen
5. **Instagram** (niedrige Priorität) - Panel fehlt, neu erstellen
6. **Facebook** (niedrige Priorität) - Panel fehlt, neu erstellen

### Empfohlene Vorschläge
- **Email:** Vorschlag 2 (Standard) - vollständige Personalisierung
- **Reddit:** Vorschlag 2 (Standard) - vollständige Verwaltung
- **Twitter:** Vorschlag 2 (Standard) - Account + Hashtag Management
- **LinkedIn:** Vorschlag 2 (Standard) - Connections + Pages
- **Instagram:** Vorschlag 2 (Standard) - Account + Hashtag + Location
- **Facebook:** Vorschlag 2 (Standard) - Pages + Groups + Events

### Nächste Schritte
1. Panel-Schemas mit `targetSchema` erweitern
2. Neue API-Endpoints (`/targets` statt `/recipients`, etc.) verwenden
3. `target-list` Field-Type im Frontend implementieren
4. Custom Fields in Add/Edit-Forms rendern
5. Migration von alten Datenstrukturen (Strings → Objects)

---

## Visuelle Panel-Darstellungen

### 1. Email Platform - Vorschlag 2 (Standard)

#### Tab 1: Empfänger
```
┌─────────────────────────────────────────────────────────┐
│ 📧 Email Recipients                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─ Target-Liste ────────────────────────────────────┐ │
│ │                                                    │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ Email                │ Name      │ Actions │  │ │
│ │  ├────────────────────────────────────────────┤  │ │
│ │  │ max@example.com      │ Max M.    │ [✏️][🗑️]│  │ │
│ │  │ anna@example.com     │ Anna K.   │ [✏️][🗑️]│  │ │
│ │  │ events@venue.de      │ -         │ [✏️][🗑️]│  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  [+ Neuen Empfänger hinzufügen]                   │ │
│ └────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Neue Email hinzufügen ───────────────────────────┐ │
│ │                                                    │ │
│ │  Email-Adresse *                                    │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ events@venue.de                            │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  Name                                             │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │                                            │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  Geburtstag                                       │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ [📅] 1990-05-15                           │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  Firma                                            │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │                                            │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  Tags                                             │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ [VIP] [Newsletter] [Events]               │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  [Hinzufügen]                                     │ │
│ └────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Empfänger bearbeiten ─────────────────────────────┐ │
│ │                                                    │ │
│ │  Empfänger auswählen *                             │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ max@example.com (Max M.)        ▼          │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  [Felder werden dynamisch geladen]                │ │
│ │                                                    │ │
│ │  Email: max@example.com                           │ │
│ │  Name: Max Mustermann                             │ │
│ │  Geburtstag: 1990-05-15                          │ │
│ │  Firma: Example Corp                              │ │
│ │  Tags: [VIP] [Newsletter]                        │ │
│ │                                                    │ │
│ │  [Speichern] [Abbrechen]                          │ │
│ └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### Tab 2: Gruppen
```
┌─────────────────────────────────────────────────────────┐
│ 📁 Email-Gruppen                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─ Gruppen-Liste ─────────────────────────────────────┐ │
│ │                                                    │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ Gruppenname        │ Empfänger │ Actions │  │ │
│ │  ├────────────────────────────────────────────┤  │ │
│ │  │ VIPs               │ 12        │ [✏️][🗑️]│  │ │
│ │  │ Newsletter         │ 45        │ [✏️][🗑️]│  │ │
│ │  │ Events             │ 8         │ [✏️][🗑️]│  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ └────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Neue Gruppe erstellen ────────────────────────────┐ │
│ │                                                    │ │
│ │  Gruppenname                                       │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │                                            │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  Empfänger auswählen                               │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ [x] max@example.com (Max M.)                │  │ │
│ │  │ [x] anna@example.com (Anna K.)             │  │ │
│ │  │ [ ] events@venue.de                        │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  [Gruppe erstellen]                                │ │
│ └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### Tab 3: Personalisierung
```
┌─────────────────────────────────────────────────────────┐
│ 🎯 Personalisierung                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─ Personalisierungs-Einstellungen ───────────────────┐ │
│ │                                                    │ │
│ │  ☑ Personalisierung aktivieren                     │ │
│ │                                                    │ │
│ │  Zu verwendende Felder *                            │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ [x] Name                                   │  │ │
│ │  │ [x] Geburtstag                             │  │ │
│ │  │ [ ] Firma                                  │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  Beispiel:                                        │ │
│ │  "Hallo {name}, wir wünschen dir zum             │ │
│ │   {birthday} alles Gute!"                         │ │
│ │                                                    │ │
│ │  [Speichern]                                       │ │
│ └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

### 2. Reddit Platform - Vorschlag 2 (Standard)

#### Tab 1: Subreddits
```
┌─────────────────────────────────────────────────────────┐
│ 🔴 Reddit Subreddits                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─ Subreddit-Liste ───────────────────────────────────┐ │
│ │                                                    │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ Subreddit      │ Status │ Tags    │ Actions│ │
│ │  ├────────────────────────────────────────────┤  │ │
│ │  │ r/electronic   │ ✅     │ Music   │ [✏️][🗑️]│ │
│ │  │ r/techno       │ ✅     │ Music   │ [✏️][🗑️]│ │
│ │  │ r/leipzig      │ ⚠️     │ Local   │ [✏️][🗑️]│ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  [+ Neues Subreddit hinzufügen]                   │ │
│ └────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Neues Subreddit hinzufügen ───────────────────────┐ │
│ │                                                    │ │
│ │  Subreddit Name *                                   │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ electronicmusic                            │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  Beschreibung                                       │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ Community für elektronische Musik          │  │ │
│ │  │                                            │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  Tags                                              │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ [Music] [Events] [Local]                   │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  ☑ Aktiv                                           │ │
│ │                                                    │ │
│ │  [Hinzufügen]                                       │ │
│ └────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Subreddit bearbeiten ──────────────────────────────┐ │
│ │                                                    │ │
│ │  Subreddit auswählen *                              │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ r/electronicmusic                ▼        │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  [Felder werden dynamisch geladen]                │ │
│ │                                                    │ │
│ │  Subreddit: electronicmusic                       │ │
│ │  Beschreibung: Community für elektronische Musik  │ │
│ │  Tags: [Music] [Events]                            │ │
│ │  Status: ✅ Aktiv                                  │ │
│ │                                                    │ │
│ │  [Speichern] [Abbrechen]                          │ │
│ └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### Tab 2: Gruppen
```
┌─────────────────────────────────────────────────────────┐
│ 📁 Subreddit-Gruppen                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─ Gruppen-Liste ─────────────────────────────────────┐ │
│ │                                                    │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ Gruppenname      │ Subreddits │ Actions  │  │ │
│ │  ├────────────────────────────────────────────┤  │ │
│ │  │ Music Events     │ 5          │ [✏️][🗑️]│  │ │
│ │  │ Local Events     │ 3          │ [✏️][🗑️]│  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ └────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Neue Gruppe erstellen ────────────────────────────┐ │
│ │                                                    │ │
│ │  Gruppenname                                       │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ Music Events                              │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  Subreddits auswählen                              │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ [x] r/electronicmusic                     │  │ │
│ │  │ [x] r/techno                              │  │ │
│ │  │ [x] r/house                               │  │ │
│ │  │ [ ] r/leipzig                             │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  [Gruppe erstellen]                                │ │
│ └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### Tab 3: Analytics
```
┌─────────────────────────────────────────────────────────┐
│ 📊 Subreddit-Statistiken                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─ Subreddit auswählen ───────────────────────────────┐ │
│ │                                                    │ │
│ │  Subreddit *                                        │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ r/electronicmusic                ▼        │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ └────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Statistiken ───────────────────────────────────────┐ │
│ │                                                    │ │
│ │  📈 Mitglieder: 125,000                            │ │
│ │  📊 Posts (letzte 7 Tage): 234                      │ │
│ │  💬 Engagement Rate: 4.2%                           │ │
│ │  ⏰ Optimaler Posting-Zeitpunkt: 18:00-20:00        │ │
│ │                                                    │ │
│ │  [Grafik: Engagement über Zeit]                     │ │
│ └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

### 3. Twitter Platform - Vorschlag 2 (Standard)

#### Tab 1: Accounts
```
┌─────────────────────────────────────────────────────────┐
│ 🐦 Twitter Accounts                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─ Account-Liste ─────────────────────────────────────┐ │
│ │                                                    │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ Username      │ Anzeigename │ Status│Actions│ │
│ │  ├────────────────────────────────────────────┤  │ │
│ │  │ @eventpromo   │ EventPromo   │ ✅   │[✏️][🗑️]│ │
│ │  │ @venueleipzig  │ Venue Leipzig│ ✅   │[✏️][🗑️]│ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  [+ Neuen Account hinzufügen]                     │ │
│ └────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Neuen Account hinzufügen ─────────────────────────┐ │
│ │                                                    │ │
│ │  Twitter Username *                                 │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ @eventpromo                               │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  Anzeigename                                       │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ EventPromo                                │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  Beschreibung                                      │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ Offizieller Account für Event-Promotion   │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  ☑ Aktiv                                           │ │
│ │                                                    │ │
│ │  [Hinzufügen]                                      │ │
│ └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### Tab 2: Hashtags
```
┌─────────────────────────────────────────────────────────┐
│ #️⃣ Hashtags                                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─ Hashtag-Liste ─────────────────────────────────────┐ │
│ │                                                    │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ Hashtag        │ Beschreibung      │ Actions│ │
│ │  ├────────────────────────────────────────────┤  │ │
│ │  │ #Event         │ Event-Hashtag     │ [✏️][🗑️]│ │
│ │  │ #Nightlife     │ Nightlife-Tag     │ [✏️][🗑️]│ │
│ │  │ #Leipzig       │ Lokaler Tag       │ [✏️][🗑️]│ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  [+ Neuen Hashtag hinzufügen]                      │ │
│ └────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Neuen Hashtag hinzufügen ─────────────────────────┐ │
│ │                                                    │ │
│ │  Hashtag *                                          │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ #Event                                     │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  Beschreibung                                      │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ Allgemeiner Hashtag für Events            │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  [Hinzufügen]                                      │ │
│ └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

### 4. LinkedIn Platform - Vorschlag 2 (Standard)

#### Tab 1: Connections
```
┌─────────────────────────────────────────────────────────┐
│ 💼 LinkedIn Connections                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─ Connection-Liste ───────────────────────────────────┐ │
│ │                                                    │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ Name          │ Firma      │ Titel │Actions│ │
│ │  ├────────────────────────────────────────────┤  │ │
│ │  │ Max M.        │ ExampleCorp │ CEO  │[✏️][🗑️]│ │
│ │  │ Anna K.       │ Tech Inc    │ CTO  │[✏️][🗑️]│ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  [+ Neue Connection hinzufügen]                   │ │
│ └────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Neue Connection hinzufügen ────────────────────────┐ │
│ │                                                    │ │
│ │  LinkedIn Profile URL *                             │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ https://linkedin.com/in/maxmustermann     │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  Name *                                            │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ Max Mustermann                              │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  Firma                                             │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ Example Corp                                │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  Job-Titel                                         │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ CEO                                         │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  Tags                                              │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ [VIP] [Partner] [Client]                   │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  [Hinzufügen]                                      │ │
│ └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### Tab 2: Company Pages
```
┌─────────────────────────────────────────────────────────┐
│ 🏢 Company Pages                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─ Page-Liste ────────────────────────────────────────┐ │
│ │                                                    │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ Page Name      │ URL              │ Status│Actions│ │
│ │  ├────────────────────────────────────────────┤  │ │
│ │  │ Example Corp   │ linkedin.com/... │ ✅   │[✏️][🗑️]│ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  [+ Neue Company Page hinzufügen]                  │ │
│ └────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Neue Company Page hinzufügen ─────────────────────┐ │
│ │                                                    │ │
│ │  Company Page URL *                                 │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ https://linkedin.com/company/example      │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  Page Name *                                       │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ Example Corp                                │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  ☑ Aktiv                                           │ │
│ │                                                    │ │
│ │  [Hinzufügen]                                      │ │
│ └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

### 5. Instagram Platform - Vorschlag 2 (Standard)

#### Tab 1: Accounts
```
┌─────────────────────────────────────────────────────────┐
│ 📸 Instagram Accounts                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─ Account-Liste ─────────────────────────────────────┐ │
│ │                                                    │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ Username      │ Anzeigename │ Status│Actions│ │
│ │  ├────────────────────────────────────────────┤  │ │
│ │  │ @eventpromo   │ EventPromo   │ ✅   │[✏️][🗑️]│ │
│ │  │ @venueleipzig │ Venue Leipzig│ ✅   │[✏️][🗑️]│ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  [+ Neuen Account hinzufügen]                     │ │
│ └────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Neuen Account hinzufügen ─────────────────────────┐ │
│ │                                                    │ │
│ │  Instagram Username *                                │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ @eventpromo                               │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  Anzeigename                                       │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ EventPromo                                │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  Beschreibung                                      │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ Offizieller Account für Event-Promotion   │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  ☑ Aktiv                                           │ │
│ │                                                    │ │
│ │  [Hinzufügen]                                      │ │
│ └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### Tab 2: Hashtags
```
┌─────────────────────────────────────────────────────────┐
│ #️⃣ Hashtags                                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─ Hashtag-Liste ─────────────────────────────────────┐ │
│ │                                                    │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ Hashtag        │ Beschreibung      │ Actions│ │
│ │  ├────────────────────────────────────────────┤  │ │
│ │  │ #Event         │ Event-Hashtag     │ [✏️][🗑️]│ │
│ │  │ #Nightlife     │ Nightlife-Tag     │ [✏️][🗑️]│ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  [+ Neuen Hashtag hinzufügen]                      │ │
│ └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### Tab 3: Locations
```
┌─────────────────────────────────────────────────────────┐
│ 📍 Locations                                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─ Location-Liste ────────────────────────────────────┐ │
│ │                                                    │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ Location Name    │ Adresse        │ Actions│ │
│ │  ├────────────────────────────────────────────┤  │ │
│ │  │ Werk 2           │ Leipzig        │ [✏️][🗑️]│ │
│ │  │ Conne Island     │ Leipzig        │ [✏️][🗑️]│ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  [+ Neue Location hinzufügen]                     │ │
│ └────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Neue Location hinzufügen ─────────────────────────┐ │
│ │                                                    │ │
│ │  Location Name *                                    │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ Werk 2                                    │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  Instagram Location ID                            │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │                                            │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  Adresse                                          │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ Kochstraße 132, 04277 Leipzig             │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  [Hinzufügen]                                      │ │
│ └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

### 6. Facebook Platform - Vorschlag 2 (Standard)

#### Tab 1: Pages
```
┌─────────────────────────────────────────────────────────┐
│ 👥 Facebook Pages                                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─ Page-Liste ────────────────────────────────────────┐ │
│ │                                                    │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ Page Name      │ Kategorie │ Status│Actions│ │
│ │  ├────────────────────────────────────────────┤  │ │
│ │  │ EventPromo     │ Business  │ ✅   │[✏️][🗑️]│ │
│ │  │ Venue Leipzig  │ Business  │ ✅   │[✏️][🗑️]│ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  [+ Neue Page hinzufügen]                         │ │
│ └────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Neue Page hinzufügen ─────────────────────────────┐ │
│ │                                                    │ │
│ │  Facebook Page ID *                                 │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ 123456789012345                           │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  Page Name *                                       │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ EventPromo                                │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  Page URL                                          │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ https://facebook.com/eventpromo           │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  Kategorie                                        │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ Business                        ▼         │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  ☑ Aktiv                                           │ │
│ │                                                    │ │
│ │  [Hinzufügen]                                      │ │
│ └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### Tab 2: Groups
```
┌─────────────────────────────────────────────────────────┐
│ 👥 Facebook Groups                                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─ Group-Liste ────────────────────────────────────────┐ │
│ │                                                    │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ Group Name      │ Beschreibung    │ Actions│ │
│ │  ├────────────────────────────────────────────┤  │ │
│ │  │ Leipzig Events │ Lokale Events   │ [✏️][🗑️]│ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  [+ Neue Group hinzufügen]                        │ │
│ └────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─ Neue Group hinzufügen ─────────────────────────────┐ │
│ │                                                    │ │
│ │  Facebook Group ID *                                │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ 987654321098765                           │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  Group Name *                                      │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ Leipzig Events                            │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  Beschreibung                                      │ │
│ │  ┌────────────────────────────────────────────┐  │ │
│ │  │ Gruppe für lokale Events in Leipzig       │  │ │
│ │  └────────────────────────────────────────────┘  │ │
│ │                                                    │ │
│ │  [Hinzufügen]                                      │ │
│ └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Gemeinsame UI-Patterns

### Target-Liste Komponente
```
┌─────────────────────────────────────────────────────────┐
│ [Suchfeld]                    [Filter ▼] [Sortieren ▼] │
├─────────────────────────────────────────────────────────┤
│ ☐ │ Email/Username │ Name │ Tags │ Status │ Actions    │
├─────────────────────────────────────────────────────────┤
│ ☐ │ max@example.com│ Max M│ [VIP]│ ✅     │ [✏️] [🗑️]  │
│ ☐ │ anna@example.com│ Anna │ [NEW]│ ✅     │ [✏️] [🗑️]  │
│ ☐ │ events@venue.de │ -    │ -    │ ⚠️     │ [✏️] [🗑️]  │
└─────────────────────────────────────────────────────────┘
│ [Bulk-Actions ▼] [1-10 von 25] [<] [>]                  │
```

### Add-Target Form
```
┌─────────────────────────────────────────────────────────┐
│ Base Field (Email/Username/etc.) *                       │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                                                    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ Custom Fields (dynamisch aus targetSchema):              │
│                                                          │
│ Name                                                     │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                                                    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ [Weitere Custom Fields...]                               │
│                                                          │
│ [Hinzufügen] [Abbrechen]                                 │
└─────────────────────────────────────────────────────────┘
```

### Edit-Target Modal
```
┌─────────────────────────────────────────────────────────┐
│ ✏️ Empfänger bearbeiten                          [✕]    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Target auswählen *                                       │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ max@example.com (Max M.)                  ▼         │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ [Felder werden dynamisch geladen]                        │
│                                                          │
│ Email: max@example.com                                   │
│ Name: Max Mustermann                                     │
│ Geburtstag: [📅] 1990-05-15                             │
│ Firma: Example Corp                                      │
│ Tags: [VIP] [Newsletter]                                │
│                                                          │
│ [Speichern] [Abbrechen]                                  │
└─────────────────────────────────────────────────────────┘
```

### Group-Management
```
┌─────────────────────────────────────────────────────────┐
│ Gruppen-Liste                                            │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Gruppenname │ Anzahl Targets │ Actions              │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ VIPs        │ 12             │ [✏️] [🗑️]            │ │
│ │ Newsletter  │ 45             │ [✏️] [🗑️]            │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ Neue Gruppe erstellen                                    │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Gruppenname                                         │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │                                                │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ │                                                      │ │
│ │ Targets auswählen                                     │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ ☑ max@example.com (Max M.)                      │ │ │
│ │ │ ☑ anna@example.com (Anna K.)                   │ │ │
│ │ │ ☐ events@venue.de                              │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ │                                                      │ │
│ │ [Gruppe erstellen]                                   │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Layout-Struktur (Sidebar Panel)

```
┌─────────────────────────────────────┐
│  Platform Sidebar                    │
├─────────────────────────────────────┤
│                                     │
│  [Editor] [Preview] [Panel] [Settings]│
│                                     │
│  ┌─ Panel ────────────────────────┐ │
│  │                                │ │
│  │  [Tab 1] [Tab 2] [Tab 3]       │ │
│  │                                │ │
│  │  ┌─ Section 1 ──────────────┐ │ │
│  │  │                          │ │ │
│  │  │  [Target-Liste]          │ │ │
│  │  │                          │ │ │
│  │  └──────────────────────────┘ │ │
│  │                                │ │
│  │  ┌─ Section 2 ──────────────┐ │ │
│  │  │                          │ │ │
│  │  │  [Add-Target Form]       │ │ │
│  │  │                          │ │ │
│  │  └──────────────────────────┘ │ │
│  │                                │ │
│  └────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

---

## Responsive Design

### Desktop (> 1024px)
- Sidebar Panel: 350-400px Breite
- Tabs horizontal
- Sections vertikal gestapelt
- Target-Liste: Tabelle mit allen Spalten

### Tablet (768px - 1024px)
- Sidebar Panel: 300-350px Breite
- Tabs horizontal (kompakt)
- Sections vertikal gestapelt
- Target-Liste: Tabelle mit wichtigsten Spalten

### Mobile (< 768px)
- Panel als Modal/Drawer
- Tabs als Dropdown
- Sections als Accordions
- Target-Liste: Karten-Layout statt Tabelle

---

## Interaktive Features

### Target-Liste
- **Sortierung:** Klick auf Spalten-Header
- **Filter:** Suchfeld + Filter-Dropdown
- **Bulk-Actions:** Checkboxen für Mehrfachauswahl
- **Inline-Edit:** Klick auf ✏️ öffnet Edit-Modal
- **Delete:** Klick auf 🗑️ mit Bestätigung

### Add-Target Form
- **Validation:** Real-time (Backend-API)
- **Auto-Complete:** Für Base-Field (z.B. Email-Suggestions)
- **Dynamic Fields:** Custom Fields werden aus `targetSchema` geladen
- **Success-Feedback:** Toast-Notification + Liste aktualisiert

### Edit-Target Modal
- **Target-Auswahl:** Dropdown mit Suche
- **Dynamic Form:** Felder werden basierend auf `targetSchema` gerendert
- **Save:** PUT Request an `/targets/:targetId`
- **Cancel:** Schließt Modal ohne Änderungen

### Group-Management
- **Group-Liste:** Zeigt Gruppenname + Anzahl Targets
- **Create Group:** Form mit Name + Multiselect für Targets
- **Edit Group:** Öffnet Modal mit bestehenden Werten
- **Delete Group:** Mit Bestätigung (keine Targets werden gelöscht)
