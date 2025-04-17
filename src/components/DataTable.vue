<template>
  <div class="data-table-container">
    <div class="data-table-controls">
      <div class="search-container">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search..."
          class="search-input"
          @input="handleSearch"
        />
      </div>
      <div class="pagination-container">
        <button
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
          class="pagination-button"
        >
          Previous
        </button>
        <span class="pagination-info">
          {{ currentPage }} / {{ totalPages }}
        </span>
        <button
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
          class="pagination-button"
        >
          Next
        </button>
      </div>
    </div>
    
    <table class="data-table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key" @click="sortBy(column.key)">
            {{ column.label }}
            <span v-if="sortKey === column.key" class="sort-icon">
              {{ sortOrder === 'asc' ? '▲' : '▼' }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in paginatedData" :key="index">
          <td v-for="column in columns" :key="column.key">
            <slot :name="column.key" :item="item">
              {{ item[column.key] }}
            </slot>
          </td>
        </tr>
        <tr v-if="paginatedData.length === 0">
          <td :colspan="columns.length" class="no-data">No data available</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watch } from 'vue';

export interface TableColumn {
  key: string;
  label: string;
}

export default defineComponent({
  name: 'DataTable',
  props: {
    data: {
      type: Array as PropType<Record<string, any>[]>,
      required: true
    },
    columns: {
      type: Array as PropType<TableColumn[]>,
      required: true
    },
    itemsPerPage: {
      type: Number,
      default: 10
    }
  },
  setup(props) {
    const currentPage = ref(1);
    const searchQuery = ref('');
    const sortKey = ref('');
    const sortOrder = ref<'asc' | 'desc'>('asc');
    
    // Filter data based on search query
    const filteredData = computed(() => {
      if (!searchQuery.value) return props.data;
      
      const query = searchQuery.value.toLowerCase();
      return props.data.filter(item => 
        props.columns.some(column => 
          String(item[column.key]).toLowerCase().includes(query)
        )
      );
    });
    
    // Sort filtered data
    const sortedData = computed(() => {
      const data = [...filteredData.value];
      
      if (sortKey.value) {
        data.sort((a, b) => {
          const valueA = a[sortKey.value];
          const valueB = b[sortKey.value];
          
          if (typeof valueA === 'string' && typeof valueB === 'string') {
            return sortOrder.value === 'asc' 
              ? valueA.localeCompare(valueB) 
              : valueB.localeCompare(valueA);
          }
          
          return sortOrder.value === 'asc' 
            ? valueA - valueB 
            : valueB - valueA;
        });
      }
      
      return data;
    });
    
    // Calculate total pages
    const totalPages = computed(() => {
      return Math.max(1, Math.ceil(filteredData.value.length / props.itemsPerPage));
    });
    
    // Get paginated data for current page
    const paginatedData = computed(() => {
      const startIdx = (currentPage.value - 1) * props.itemsPerPage;
      const endIdx = startIdx + props.itemsPerPage;
      return sortedData.value.slice(startIdx, endIdx);
    });
    
    // Reset to first page when data or search changes
    watch([() => props.data, searchQuery], () => {
      currentPage.value = 1;
    });
    
    // Sort table by column
    const sortBy = (key: string) => {
      if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortKey.value = key;
        sortOrder.value = 'asc';
      }
    };
    
    // Change page
    const changePage = (page: number) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
      }
    };
    
    // Handle search with debounce
    const handleSearch = () => {
      currentPage.value = 1;
    };
    
    return {
      currentPage,
      searchQuery,
      sortKey,
      sortOrder,
      totalPages,
      paginatedData,
      sortBy,
      changePage,
      handleSearch
    };
  }
});
</script>

<style scoped>
.data-table-container {
  width: 100%;
  font-family: Arial, sans-serif;
}

.data-table-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  align-items: center;
}

.search-container {
  flex: 1;
  max-width: 300px;
}

.search-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.pagination-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagination-button {
  padding: 6px 12px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background-color: #f5f5f5;
  padding: 10px;
  text-align: left;
  font-weight: bold;
  border-bottom: 2px solid #ddd;
  cursor: pointer;
  user-select: none;
}

.data-table th:hover {
  background-color: #e8e8e8;
}

.data-table td {
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.data-table tr:hover {
  background-color: #f9f9f9;
}

.sort-icon {
  margin-left: 5px;
  display: inline-block;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #777;
}
</style>
