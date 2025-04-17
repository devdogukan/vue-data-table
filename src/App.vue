<template>
  <div class="app">
    <h1>Vue Dynamic Data Table</h1>
    <p class="description">A fully featured data table component with search, sort, filter, pagination, edit, add, delete and selection capabilities.</p>
    
    <DataTable 
      v-model:data="users" 
      :columns="columns" 
      :filters="filters"
      :itemsPerPage="5"
      @row-deleted="handleRowDeleted"
      @row-edited="handleRowEdited"
      @row-added="handleRowAdded"
    >
      <template #name="{ item }">
        <strong>{{ item.name }}</strong>
      </template>
      <template #email="{ item }">
        <a :href="`mailto:${item.email}`">{{ item.email }}</a>
      </template>
      <template #status="{ item }">
        <span :class="['status-badge', item.status.toLowerCase()]">{{ item.status }}</span>
      </template>
    </DataTable>
    
    <div class="events-log">
      <h2>Events Log</h2>
      <div class="log-container">
        <div v-for="(log, index) in eventLogs" :key="index" class="log-entry">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-type" :class="log.type">{{ log.type }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
        <div v-if="eventLogs.length === 0" class="no-logs">
          No events logged yet
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import DataTable, { TableColumn, TableFilter } from './components/DataTable.vue';

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
    
    // Define filters for status and role
    const filters = ref<TableFilter[]>([
      { 
        label: 'Active Users', 
        value: 'active', 
        predicate: (item: any) => item.status === 'Active' 
      },
      { 
        label: 'Inactive Users', 
        value: 'inactive', 
        predicate: (item: any) => item.status === 'Inactive' 
      },
      { 
        label: 'Admins', 
        value: 'admin', 
        predicate: (item: any) => item.role === 'Admin' 
      },
      { 
        label: 'Editors', 
        value: 'editor', 
        predicate: (item: any) => item.role === 'Editor' 
      },
      { 
        label: 'Standard Users', 
        value: 'user', 
        predicate: (item: any) => item.role === 'User' 
      }
    ]);
    
    // Event logging
    const eventLogs = ref<{ time: string; type: string; message: string }[]>([]);
    
    const logEvent = (type: string, message: string) => {
      const now = new Date();
      const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      
      eventLogs.value.unshift({ time, type, message });
      
      // Limit log size
      if (eventLogs.value.length > 10) {
        eventLogs.value.pop();
      }
    };
    
    const handleRowDeleted = (row: any | any[]) => {
      if (Array.isArray(row)) {
        logEvent('delete', `Deleted ${row.length} rows`);
      } else {
        logEvent('delete', `Deleted row: ${row.name}`);
      }
    };
    
    const handleRowEdited = ({ original, edited }: { original: any; edited: any }) => {
      logEvent('edit', `Edited row: ${original.name} → ${edited.name}`);
    };
    
    const handleRowAdded = (row: any) => {
      logEvent('add', `Added new row: ${row.name}`);
    };
    
    return {
      columns,
      users,
      filters,
      eventLogs,
      handleRowDeleted,
      handleRowEdited,
      handleRowAdded
    };
  }
});
</script>

<style>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 10px;
  color: #333;
}

.description {
  text-align: center;
  margin-bottom: 30px;
  color: #666;
}

.events-log {
  margin-top: 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  background-color: #f8f9fa;
}

.events-log h2 {
  margin-top: 0;
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
}

.log-container {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
}

.log-entry {
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  font-family: monospace;
  font-size: 14px;
}

.log-time {
  color: #666;
  margin-right: 10px;
}

.log-type {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  margin-right: 10px;
  color: white;
  font-weight: bold;
}

.log-type.edit {
  background-color: #17a2b8;
}

.log-type.delete {
  background-color: #dc3545;
}

.log-type.add {
  background-color: #28a745;
}

.log-message {
  color: #333;
}

.no-logs {
  padding: 20px;
  text-align: center;
  color: #999;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.status-badge.active {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background-color: #f8d7da;
  color: #721c24;
}
</style>
