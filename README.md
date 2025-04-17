# vue-data-table

A comprehensive Vue 3 data table component with all the features you need for data management.

## Features

### Completed Features
- ✅ Search - Full text search across all columns
- ✅ Sortable - Click on column headers to sort
- ✅ Delete - Delete individual rows or bulk delete
- ✅ Pagination - Navigate through pages of data
- ✅ Filter - Filter data using predefined filters
- ✅ Edit - Edit existing records inline
- ✅ Add - Add new records to the table
- ✅ Select - Select individual or all rows for bulk operations

## Usage

```vue
<template>
  <DataTable 
    v-model:data="users" 
    :columns="columns" 
    :filters="filters"
    :itemsPerPage="10"
    @row-deleted="handleRowDeleted"
    @row-edited="handleRowEdited"
    @row-added="handleRowAdded"
  >
    <!-- Optional slot for custom column rendering -->
    <template #name="{ item }">
      <strong>{{ item.name }}</strong>
    </template>
  </DataTable>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import DataTable from './components/DataTable.vue';

export default defineComponent({
  components: { DataTable },
  setup() {
    const columns = ref([
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' }
    ]);
    
    const users = ref([
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ]);
    
    const filters = ref([
      { 
        label: 'Active Users', 
        value: 'active', 
        predicate: (item) => item.status === 'Active' 
      }
    ]);
    
    return { columns, users, filters };
  }
});
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | Array | required | Array of objects to display in the table |
| columns | Array | required | Column definitions with key and label properties |
| itemsPerPage | Number | 10 | Number of items to display per page |
| editable | Boolean | true | Enable inline editing of rows |
| deletable | Boolean | true | Enable row deletion |
| selectable | Boolean | true | Enable row selection |
| filters | Array | [] | Predefined filters for the data |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| update:data | Array | Emitted when data changes (for v-model binding) |
| row-deleted | Object/Array | Emitted when a row or rows are deleted |
| row-edited | Object | Emitted when a row is edited with both original and edited row |
| row-added | Object | Emitted when a new row is added |

## Slots

You can customize column rendering using named slots that match the column key.

```vue
<template #name="{ item }">
  <strong>{{ item.name }}</strong>
</template>
```

## Styling

The component comes with default styling but can be easily customized using CSS.
