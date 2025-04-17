<template>
  <div class="data-table-container">
    <!-- Controls section -->
    <div class="data-table-controls">
      <div class="search-add-container">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search..."
          class="search-input"
          @input="handleSearch"
        />
        <button @click="addNewRow" class="add-button">
          <span>+ Add New</span>
        </button>
      </div>
      
      <div class="filter-container" v-if="filters.length">
        <select v-model="activeFilter" @change="applyFilter" class="filter-select">
          <option value="">All</option>
          <option v-for="filter in filters" :key="filter.value" :value="filter.value">
            {{ filter.label }}
          </option>
        </select>
      </div>
    </div>
    
    <!-- Bulk Actions -->
    <div class="bulk-actions" v-if="selectedRows.length > 0">
      <span>{{ selectedRows.length }} items selected</span>
      <button @click="deleteSelected" class="delete-selected-button">Delete Selected</button>
    </div>

    <!-- Table -->
    <table class="data-table">
      <thead>
        <tr>
          <th class="selection-column" v-if="selectable">
            <input 
              type="checkbox" 
              :checked="allSelected" 
              :indeterminate="someSelected" 
              @change="toggleSelectAll"
            />
          </th>
          <th v-for="column in columns" :key="column.key" @click="sortBy(column.key)">
            {{ column.label }}
            <span v-if="sortKey === column.key" class="sort-icon">
              {{ sortOrder === 'asc' ? '▲' : '▼' }}
            </span>
          </th>
          <th v-if="editable || deletable" class="actions-column">Actions</th>
        </tr>
      </thead>
      <tbody>
        <!-- Edit row (visible when adding a new row) -->
        <tr v-if="isAdding" class="edit-row">
          <td v-if="selectable"></td>
          <td v-for="column in columns" :key="column.key">
            <input 
              v-model="newRow[column.key]" 
              :placeholder="`Enter ${column.label}`"
              class="edit-input"
            />
          </td>
          <td class="actions-cell">
            <button @click="saveNewRow" class="save-button">Save</button>
            <button @click="cancelAddRow" class="cancel-button">Cancel</button>
          </td>
        </tr>
        
        <!-- Data rows -->
        <template v-for="(item, index) in paginatedData" :key="item.id || index">
          <!-- Display row -->
          <tr v-if="editingIndex !== index" :class="{ 'selected-row': isSelected(item) }">
            <td class="selection-column" v-if="selectable">
              <input 
                type="checkbox" 
                :checked="isSelected(item)" 
                @change="toggleSelect(item)"
              />
            </td>
            <td v-for="column in columns" :key="column.key">
              <slot :name="column.key" :item="item">
                {{ item[column.key] }}
              </slot>
            </td>
            <td v-if="editable || deletable" class="actions-cell">
              <button v-if="editable" @click="editRow(index)" class="edit-button">Edit</button>
              <button v-if="deletable" @click="deleteRow(index)" class="delete-button">Delete</button>
            </td>
          </tr>
          
          <!-- Edit row -->
          <tr v-else class="edit-row">
            <td v-if="selectable"></td>
            <td v-for="column in columns" :key="column.key">
              <input 
                v-model="editedRow[column.key]" 
                class="edit-input"
              />
            </td>
            <td class="actions-cell">
              <button @click="saveEdit(index)" class="save-button">Save</button>
              <button @click="cancelEdit" class="cancel-button">Cancel</button>
            </td>
          </tr>
        </template>
        
        <tr v-if="paginatedData.length === 0 && !isAdding">
          <td :colspan="columns.length + (selectable ? 1 : 0) + ((editable || deletable) ? 1 : 0)" class="no-data">
            No data available
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- Pagination -->
    <div class="pagination-container">
      <button
        :disabled="currentPage === 1"
        @click="changePage(1)"
        class="pagination-button"
      >
        First
      </button>
      <button
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
        class="pagination-button"
      >
        Previous
      </button>
      
      <div class="page-numbers">
        <button 
          v-for="page in displayedPages" 
          :key="page"
          @click="changePage(page)"
          :class="['page-number', { active: currentPage === page }]"
        >
          {{ page }}
        </button>
      </div>
      
      <button
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
        class="pagination-button"
      >
        Next
      </button>
      <button
        :disabled="currentPage === totalPages"
        @click="changePage(totalPages)"
        class="pagination-button"
      >
        Last
      </button>
      
      <div class="items-per-page">
        <span>Items per page:</span>
        <select v-model.number="itemsPerPageModel">
          <option v-for="option in itemsPerPageOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </div>
      
      <div class="pagination-info">
        Page {{ currentPage }} of {{ totalPages }} 
        ({{ filteredData.length }} items)
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watch, reactive } from 'vue';

export interface TableColumn {
  key: string;
  label: string;
  filterable?: boolean;
}

export interface TableFilter {
  label: string;
  value: string;
  predicate: (item: any) => boolean;
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
    },
    editable: {
      type: Boolean,
      default: true
    },
    deletable: {
      type: Boolean,
      default: true
    },
    selectable: {
      type: Boolean,
      default: true
    },
    filters: {
      type: Array as PropType<TableFilter[]>,
      default: () => []
    }
  },
  emits: ['update:data', 'row-deleted', 'row-edited', 'row-added'],
  setup(props, { emit }) {
    // Pagination
    const currentPage = ref(1);
    const itemsPerPageModel = ref(props.itemsPerPage);
    const itemsPerPageOptions = [5, 10, 20, 50, 100];
    
    // Searching & Sorting
    const searchQuery = ref('');
    const sortKey = ref('');
    const sortOrder = ref<'asc' | 'desc'>('asc');
    const activeFilter = ref('');
    
    // Editing state
    const editingIndex = ref(-1);
    const editedRow = reactive({} as Record<string, any>);
    
    // Adding state
    const isAdding = ref(false);
    const newRow = reactive({} as Record<string, any>);
    
    // Selection state
    const selectedRows = ref<Record<string, any>[]>([]);
    
    // Reactive data source (allows for mutations)
    const localData = ref([...props.data]);
    
    // Watch for external data changes
    watch(() => props.data, (newValue) => {
      localData.value = [...newValue];
    }, { deep: true });
    
    // Filter data based on search query and active filter
    const filteredData = computed(() => {
      let result = localData.value;
      
      // Apply search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(item => 
          props.columns.some(column => 
            String(item[column.key]).toLowerCase().includes(query)
          )
        );
      }
      
      // Apply custom filter
      if (activeFilter.value) {
        const filter = props.filters.find(f => f.value === activeFilter.value);
        if (filter) {
          result = result.filter(filter.predicate);
        }
      }
      
      return result;
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
      return Math.max(1, Math.ceil(filteredData.value.length / itemsPerPageModel.value));
    });
    
    // Get paginated data for current page
    const paginatedData = computed(() => {
      const startIdx = (currentPage.value - 1) * itemsPerPageModel.value;
      const endIdx = startIdx + itemsPerPageModel.value;
      return sortedData.value.slice(startIdx, endIdx);
    });
    
    // Calculate displayed page numbers
    const displayedPages = computed(() => {
      const maxPageButtons = 5;
      const pages = [];
      
      if (totalPages.value <= maxPageButtons) {
        // Show all pages
        for (let i = 1; i <= totalPages.value; i++) {
          pages.push(i);
        }
      } else {
        // Show limited pages with current page in the middle when possible
        let startPage = Math.max(1, currentPage.value - Math.floor(maxPageButtons / 2));
        let endPage = startPage + maxPageButtons - 1;
        
        if (endPage > totalPages.value) {
          endPage = totalPages.value;
          startPage = Math.max(1, endPage - maxPageButtons + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }
      }
      
      return pages;
    });
    
    // Selection computed properties
    const allSelected = computed(() => {
      return paginatedData.value.length > 0 && selectedRows.value.length === paginatedData.value.length;
    });
    
    const someSelected = computed(() => {
      return selectedRows.value.length > 0 && selectedRows.value.length < paginatedData.value.length;
    });
    
    // Reset to first page when data or search changes
    watch([searchQuery, activeFilter, itemsPerPageModel], () => {
      currentPage.value = 1;
    });
    
    // CRUD Functions
    
    // Delete a row
    const deleteRow = (index: number) => {
      const actualIndex = (currentPage.value - 1) * itemsPerPageModel.value + index;
      const deleted = filteredData.value[actualIndex];
      
      // Remove from local data
      const realIndex = localData.value.findIndex(item => 
        JSON.stringify(item) === JSON.stringify(deleted)
      );
      
      if (realIndex !== -1) {
        localData.value.splice(realIndex, 1);
        
        // Remove from selected rows if selected
        const selectedIndex = selectedRows.value.findIndex(item => 
          JSON.stringify(item) === JSON.stringify(deleted)
        );
        
        if (selectedIndex !== -1) {
          selectedRows.value.splice(selectedIndex, 1);
        }
        
        // Emit events
        emit('row-deleted', deleted);
        emit('update:data', localData.value);
      }
    };
    
    // Delete selected rows
    const deleteSelected = () => {
      if (selectedRows.value.length === 0) return;
      
      // Create a new array excluding the selected items
      localData.value = localData.value.filter(item => 
        !selectedRows.value.some(selected => JSON.stringify(selected) === JSON.stringify(item))
      );
      
      // Emit update event
      emit('row-deleted', selectedRows.value);
      emit('update:data', localData.value);
      
      // Clear selection
      selectedRows.value = [];
    };
    
    // Edit row functions
    const editRow = (index: number) => {
      // Store the index of the row being edited
      editingIndex.value = index;
      
      // Copy the row data for editing
      const rowToEdit = paginatedData.value[index];
      for (const key in rowToEdit) {
        editedRow[key] = rowToEdit[key];
      }
    };
    
    const saveEdit = (index: number) => {
      const actualIndex = (currentPage.value - 1) * itemsPerPageModel.value + index;
      const originalRow = filteredData.value[actualIndex];
      
      // Find the real index in localData
      const realIndex = localData.value.findIndex(item => 
        JSON.stringify(item) === JSON.stringify(originalRow)
      );
      
      if (realIndex !== -1) {
        // Update the data
        for (const key in editedRow) {
          localData.value[realIndex][key] = editedRow[key];
        }
        
        // Also update in selectedRows if selected
        const selectedIndex = selectedRows.value.findIndex(item => 
          JSON.stringify(item) === JSON.stringify(originalRow)
        );
        
        if (selectedIndex !== -1) {
          for (const key in editedRow) {
            selectedRows.value[selectedIndex][key] = editedRow[key];
          }
        }
        
        // Emit events
        emit('row-edited', { original: originalRow, edited: localData.value[realIndex] });
        emit('update:data', localData.value);
      }
      
      // Reset editing state
      editingIndex.value = -1;
    };
    
    const cancelEdit = () => {
      editingIndex.value = -1;
    };
    
    // Add row functions
    const addNewRow = () => {
      isAdding.value = true;
      
      // Initialize new row with empty values
      for (const column of props.columns) {
        newRow[column.key] = '';
      }
    };
    
    const saveNewRow = () => {
      // Add new row to data
      localData.value.unshift({ ...newRow, id: Date.now() }); // Adding a unique ID
      
      // Emit events
      emit('row-added', newRow);
      emit('update:data', localData.value);
      
      // Reset state
      isAdding.value = false;
      for (const key in newRow) {
        newRow[key] = '';
      }
    };
    
    const cancelAddRow = () => {
      isAdding.value = false;
      for (const key in newRow) {
        newRow[key] = '';
      }
    };
    
    // Selection functions
    const toggleSelect = (item: Record<string, any>) => {
      const index = selectedRows.value.findIndex(row => 
        JSON.stringify(row) === JSON.stringify(item)
      );
      
      if (index === -1) {
        selectedRows.value.push(item);
      } else {
        selectedRows.value.splice(index, 1);
      }
    };
    
    const isSelected = (item: Record<string, any>) => {
      return selectedRows.value.some(row => 
        JSON.stringify(row) === JSON.stringify(item)
      );
    };
    
    const toggleSelectAll = () => {
      if (allSelected.value) {
        selectedRows.value = [];
      } else {
        selectedRows.value = [...paginatedData.value];
      }
    };
    
    // Sorting function
    const sortBy = (key: string) => {
      if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortKey.value = key;
        sortOrder.value = 'asc';
      }
    };
    
    // Pagination functions
    const changePage = (page: number) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        // Reset editing state when changing pages
        editingIndex.value = -1;
      }
    };
    
    // Filter functions
    const applyFilter = () => {
      currentPage.value = 1;
    };
    
    // Search function
    const handleSearch = () => {
      currentPage.value = 1;
    };
    
    return {
      // Data
      localData,
      filteredData,
      sortedData,
      paginatedData,
      
      // Pagination
      currentPage,
      totalPages,
      itemsPerPageModel,
      itemsPerPageOptions,
      displayedPages,
      changePage,
      
      // Sorting & Filtering
      searchQuery,
      sortKey,
      sortOrder,
      activeFilter,
      sortBy,
      applyFilter,
      handleSearch,
      
      // Editing
      editingIndex,
      editedRow,
      editRow,
      saveEdit,
      cancelEdit,
      
      // Adding
      isAdding,
      newRow,
      addNewRow,
      saveNewRow,
      cancelAddRow,
      
      // Deleting
      deleteRow,
      deleteSelected,
      
      // Selection
      selectedRows,
      isSelected,
      toggleSelect,
      allSelected,
      someSelected,
      toggleSelectAll
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

.search-add-container {
  display: flex;
  gap: 10px;
  flex: 1;
  max-width: 500px;
}

.search-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.add-button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-button:hover {
  background-color: #45a049;
}

.filter-container {
  margin-left: 16px;
}

.filter-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.bulk-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
}

.delete-selected-button {
  padding: 6px 12px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-selected-button:hover {
  background-color: #c82333;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination-button {
  padding: 6px 12px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-number {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  background-color: #fff;
}

.page-number.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 10px;
}

.items-per-page select {
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.pagination-info {
  font-size: 14px;
  color: #6c757d;
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

.selection-column {
  width: 40px;
  text-align: center;
}

.actions-column {
  width: 120px;
  text-align: center;
}

.data-table td {
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.actions-cell {
  display: flex;
  justify-content: center;
  gap: 5px;
}

.edit-button {
  padding: 4px 8px;
  background-color: #17a2b8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-button:hover {
  background-color: #138496;
}

.delete-button {
  padding: 4px 8px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-button:hover {
  background-color: #c82333;
}

.save-button {
  padding: 4px 8px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-button:hover {
  background-color: #218838;
}

.cancel-button {
  padding: 4px 8px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-button:hover {
  background-color: #5a6268;
}

.data-table tr:hover {
  background-color: #f9f9f9;
}

.edit-row {
  background-color: #f8f9fa;
}

.edit-input {
  width: 100%;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.selected-row {
  background-color: #e6f3ff;
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
