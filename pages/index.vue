<script setup lang="ts">
import prisma from "~/lib/prisma";

definePageMeta({
  middleware: ["auth"],
});
</script>

<template>
  <div>
    You are now logged in - check for auth
  </div>
</template>

<style scoped></style>
