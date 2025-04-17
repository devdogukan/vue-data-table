<template>
  <div class="app">
    <h1>Dynamic Data Table Example</h1>
    
    <DataTable :data="users" :columns="columns" :itemsPerPage="5">
      <template #name="{ item }">
        <strong>{{ item.name }}</strong>
      </template>
      <template #email="{ item }">
        <a :href="`mailto:${item.email}`">{{ item.email }}</a>
      </template>
    </DataTable>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import DataTable, { TableColumn } from './components/DataTable.vue';

export default defineComponent({
  name: 'App',
  components: {
    DataTable
  },
  setup() {
    const columns = ref<TableColumn[]>([
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
      { key: 'status', label: 'Status' }
    ]);
    
    const users = ref([
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'Active' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
      { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Admin', status: 'Active' },
      { id: 5, name: 'Mike Brown', email: 'mike@example.com', role: 'User', status: 'Active' },
      { id: 6, name: 'Emily Davis', email: 'emily@example.com', role: 'Editor', status: 'Inactive' },
      { id: 7, name: 'Alex Turner', email: 'alex@example.com', role: 'User', status: 'Active' },
      { id: 8, name: 'Olivia Martinez', email: 'olivia@example.com', role: 'Admin', status: 'Active' },
      { id: 9, name: 'Daniel Lee', email: 'daniel@example.com', role: 'User', status: 'Inactive' },
      { id: 10, name: 'Sophia Clark', email: 'sophia@example.com', role: 'Editor', status: 'Active' },
      { id: 11, name: 'James Anderson', email: 'james@example.com', role: 'User', status: 'Active' },
      { id: 12, name: 'Emma Taylor', email: 'emma@example.com', role: 'User', status: 'Inactive' }
    ]);
    
    return {
      columns,
      users
    };
  }
});
</script>

<style>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}
</style>
