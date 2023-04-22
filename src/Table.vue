<template>
  <div>
    <div
      v-if="body?.length === 0"
      class="flex justify-center p-4 rounded bg-yellow-100 text-yellow-700 text-lg"
    >
      No data to show
    </div>
    <div v-else>
      <div v-if="searchable" class="flex mb-4">
        <input
          type="text"
          placeholder="Search in the table"
          v-model="search"
          class="flex h-10 border rounded text-sm px-4 w-full outline-none border-gray-300 focus:border-black"
        />
        <button
          v-if="sorting.sortState"
          class="flex h-10 whitespace-nowrap items-center ml-1 rounded border border-red-500 text-red-500 text-sm px-4"
          @click="sorting.sortState = null"
        >
          Cancel Sort
        </button>
      </div>
      <div class="w-full border rounded p-4">
        <table class="w-full">
          <thead>
            <tr>
              <th
                :width="h?.width"
                class="text-left bg-gray-200 font-semibold text-sm text-gray-500 p-3 border-b"
                v-for="(h, key) in props.head"
                :key="key"
              >
                {{ h.name }}
                <button v-if="h.sortable" @click="sort(key)">
                  <v-icon
                    v-if="
                      sorting.sortState?.key === key &&
                      sorting.sortState?.orderBy === 'asc'
                    "
                    name="co-sort-ascending"
                  ></v-icon>
                  <v-icon v-else name="co-sort-descending"></v-icon>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr class="group" v-for="(items, key) in filteredData" :key="key">
              <td
                class="p-3 text-sm group-hover:bg-blue-50 group-hover:text-blue-600"
                v-for="(item, key) in items"
                :key="key"
              >
                {{ item }}
              </td>
              <td>
                <div class="flex gap-x-2.5 justify-end">
                  <button
                    class="h-8 px-4 flex items-center rounded bg-blue-600 text-white"
                  >
                    Edit
                  </button>
                  <button
                    v-if="deleteFunc"
                    @click="deleteItem(key)"
                    class="h-8 px-4 flex items-center rounded bg-red-600 text-white"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        class="flex justify-between items-center w-full border rounded h-10 px-4"
      >
        <div class="flex">
          {{ body?.length }}
        </div>
        <div class="flex">
          <select v-model="page" name="pages" id="pages" class="border-2 border-black">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";

const props = defineProps({
  head: { type: Array, required: true, default: [] },
  body: { type: Array, required: true, default: [] },
  searchable: { type: Boolean, default: false },
  deleteFunc: { type: Function, default: null },
});

const page = ref(props.body.length); // for pagination
const search = ref("");
const sorting = reactive({
  sortState: null,
});

const filteredData = computed(() => {
  return props.body
    .filter((items) =>
      items.some((item) =>
        item
          .toString()
          .toLocaleLowerCase("TR")
          .includes(search.value.toLocaleLowerCase("TR"))
      )
    )
    .sort((a, b) => {
      if (sorting.sortState?.orderBy === "asc") {
        return a[sorting.sortState.key]
          .toString()
          .localeCompare(b[sorting.sortState.key]);
      }

      if (sorting.sortState?.orderBy === "desc") {
        return b[sorting.sortState.key]
          .toString()
          .localeCompare(a[sorting.sortState.key]);
      }
    })
    .splice(0, page.value);
});

const sort = (key) => {
  if (sorting.sortState?.key === key) {
    sorting.sortState = {
      key,
      orderBy: sorting.sortState.orderBy === "asc" ? "desc" : "asc",
    };
  } else {
    sorting.sortState = {
      key,
      orderBy: "asc",
    };
  }
};

const deleteItem = (key) => {
  props.deleteFunc(key);
};
</script>
