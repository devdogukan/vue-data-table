<template>
  <Table
    class="p-4"
    :head="data.head"
    :body="
      data.users.map((user) => [
        user.name,
        user.surname,
        user.email,
        user.age,
      ])
    "
    :searchable="true"
    :delete-func="delUser"
  />
</template>

<script setup>
import { reactive } from "vue";
import Table from "./Table.vue";

const data = reactive({
  head: [
    { name: "Name", sortable: true },
    { name: "Surname", sortable: true },
    { name: "Surname" },
    { name: "Age", sortable: true },
    { name: "Actions", width: 100 },
  ],

  users: [
    {
      name: "Dogukan",
      surname: "Aksoy",
      email: "da@gmail.com",
      age: 21,
    },
    {
      name: "Mehmet",
      surname: "Solak",
      email: "mehmet.solak@gmail.com",
      age: 18,
    },
    {
      name: "Mustafa",
      surname: "Akipek",
      email: "mustafa.akipek@gmail.com",
      age: 19,
    },
    {
      name: "Dogukan",
      surname: "Aksoy",
      email: "da@gmail.com",
      age: 21,
    },
    {
      name: "Mehmet",
      surname: "Solak",
      email: "mehmet.solak@gmail.com",
      age: 18,
    },
    {
      name: "Mustafa",
      surname: "Akipek",
      email: "mustafa.akipek@gmail.com",
      age: 19,
    },
    {
      name: "Dogukan",
      surname: "Aksoy",
      email: "da@gmail.com",
      age: 21,
    },
    {
      name: "Mehmet",
      surname: "Solak",
      email: "mehmet.solak@gmail.com",
      age: 18,
    },
    {
      name: "Mustafa",
      surname: "Akipek",
      email: "mustafa.akipek@gmail.com",
      age: 19,
    },
    {
      name: "Dogukan",
      surname: "Aksoy",
      email: "da@gmail.com",
      age: 21,
    },
    {
      name: "Mehmet",
      surname: "Solak",
      email: "mehmet.solak@gmail.com",
      age: 18,
    },
    {
      name: "Mustafa",
      surname: "Akipek",
      email: "mustafa.akipek@gmail.com",
      age: 19,
    },
    {
      name: "Dogukan",
      surname: "Aksoy",
      email: "da@gmail.com",
      age: 21,
    },
    {
      name: "Mehmet",
      surname: "Solak",
      email: "mehmet.solak@gmail.com",
      age: 18,
    },
    {
      name: "Mustafa",
      surname: "Akipek",
      email: "mustafa.akipek@gmail.com",
      age: 19,
    },
  ],
});

const delUser = (key) => {
  data.jobs.splice(key, 1);
};
</script>
