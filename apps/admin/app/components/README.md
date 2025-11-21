# DataTable Component

The **DataTable** component is the standard table design for all admin pages. It provides consistent styling, dark mode support, and reusable action icons.

## Basic Usage

```jsx
import DataTable, { Badge, EditIcon, DeleteIcon } from '../../components/DataTable';

const columns = [
  {
    key: 'name',
    label: 'Name',
    render: (item) => <span className="font-medium">{item.name}</span>
  },
  {
    key: 'email',
    label: 'Email',
    render: (item) => item.email
  }
];

const renderActions = (item) => (
  <>
    <EditIcon href={`/admin/items/${item.id}/edit`} />
    <DeleteIcon onClick={() => handleDelete(item.id)} />
  </>
);

<DataTable
  columns={columns}
  data={items}
  renderActions={renderActions}
  loading={loading}
  emptyMessage="No items found"
/>
```

## Props

### DataTable

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `columns` | Array | Yes | - | Array of column definitions |
| `data` | Array | Yes | - | Array of data items to display |
| `renderActions` | Function | No | - | Function to render action buttons for each row |
| `loading` | Boolean | No | false | Shows loading state |
| `emptyMessage` | String | No | "No items found" | Message shown when data is empty |

### Column Definition

Each column object should have:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `key` | String | Yes | Unique identifier for the column |
| `label` | String | Yes | Column header text |
| `align` | String | No | Text alignment: 'left', 'center', or 'right' (default: 'left') |
| `render` | Function | No | Custom render function that receives the row item |

## Components

### Badge

Status/role badge with color variants.

```jsx
import { Badge } from '../../components/DataTable';

<Badge color="blue">Active</Badge>
<Badge color="green">Published</Badge>
<Badge color="red">Inactive</Badge>
<Badge color="gray">Draft</Badge>
```

**Props:**
- `color`: 'blue' | 'green' | 'red' | 'gray' (default: 'blue')
- `children`: Badge content

### Action Icons

Pre-styled action icons for common operations.

#### EditIcon

```jsx
import { EditIcon } from '../../components/DataTable';

// As a link
<EditIcon href="/admin/users/123/edit" title="Edit User" />

// As a button
<EditIcon onClick={() => handleEdit(user)} title="Edit" />
```

**Props:**
- `href`: String (optional) - If provided, renders as a link
- `onClick`: Function (optional) - If provided (without href), renders as a button
- `title`: String - Tooltip text (default: "Edit")

#### DeleteIcon

```jsx
import { DeleteIcon } from '../../components/DataTable';

<DeleteIcon onClick={() => handleDelete(item.id)} title="Delete Item" />
```

**Props:**
- `onClick`: Function - Click handler
- `title`: String - Tooltip text (default: "Delete")

#### PublishIcon

```jsx
import { PublishIcon } from '../../components/DataTable';

<PublishIcon onClick={() => handlePublish(project.id)} title="Publish Project" />
```

**Props:**
- `onClick`: Function - Click handler
- `title`: String - Tooltip text (default: "Publish")

## Complete Example

```jsx
'use client';
import { useEffect, useState } from 'react';
import DataTable, { Badge, EditIcon, DeleteIcon, PublishIcon } from '../../components/DataTable';

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/v1/items', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/v1/items/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchItems();
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (item) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {item.name}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <Badge color={item.is_active ? 'green' : 'red'}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (item) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      )
    }
  ];

  const renderActions = (item) => (
    <>
      {!item.published && (
        <PublishIcon onClick={() => handlePublish(item.id)} />
      )}
      <EditIcon href={`/admin/items/${item.id}/edit`} />
      <DeleteIcon onClick={() => handleDelete(item.id)} />
    </>
  );

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Items</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your items</p>
        </div>
        <a href="/admin/items/create" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          ➕ Create Item
        </a>
      </div>

      <DataTable
        columns={columns}
        data={items}
        renderActions={renderActions}
        loading={loading}
        emptyMessage="No items found"
      />
    </div>
  );
}
```

## Features

- ✅ Consistent styling across all admin pages
- ✅ Full dark mode support
- ✅ Responsive design
- ✅ Loading states
- ✅ Empty states with custom messages
- ✅ Hover effects on rows
- ✅ Icon-based actions with tooltips
- ✅ Badge components for status/roles
- ✅ Flexible column rendering
- ✅ Type-safe with JSDoc comments

## Design Standards

This component follows the design standard established in `/apps/admin/app/admin/users/page.jsx`:

- Table headers: `bg-gray-50 dark:bg-gray-700`
- Row hover: `hover:bg-gray-50 dark:hover:bg-gray-700`
- Borders: `divide-gray-200 dark:divide-gray-700`
- Text colors: Follow gray-scale with dark mode variants
- Action icons: Centered with 3-gap spacing
- Badges: Rounded-full with semantic colors

## When to Use

Use the DataTable component for:
- User management pages
- Project/content listings
- CMS content tables
- E-commerce product tables
- Any tabular data in the admin panel

The component is designed to be the single source of truth for table styling across the entire admin interface.
