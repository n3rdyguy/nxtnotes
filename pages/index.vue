<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const notes = ref([]);
const selectedNote = ref([]);
const todaysNotes = computed(() => {
  return notes.value.filter((note) => {
    const noteDate = new Date(note.updated_at);
    return noteDate.toDateString() === new Date().toDateString();
  });
});
const yesterdaysNotes = computed(() => {
  return notes.value.filter((note) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const noteDate = new Date(note.updated_at);
    return noteDate.toDateString() === yesterday.toDateString();
  });
});
const earlierNotes = computed(() => {
  return notes.value.filter((note) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const noteDate = new Date(note.updated_at);
    return noteDate < yesterday && noteDate.toDateString() !== yesterday.toDateString();
  });
});
onMounted(async () => {
  notes.value = await $fetch("/api/notes");

  if (notes.value.length > 0) {
    selectedNote.value = notes.value[0];
  }
  console.log(todaysNotes.value);
});
</script>

<template>
  <div class="flex bg-zinc-900 min-h-screen">
    <!-- sidebar -->
    <div class="bg-black w-[338px] p-8">
      <Logo />
      <!-- today container -->
      <div>
        <p class="text-sm font-bold text-[#C2C2C5] mb-6 mt-12">
          Today
        </p>
        <div
          class="ml-2 space-y-2"
        >
          <div
            v-for="note in todaysNotes" class="p-2 rounded-lg cursor-pointer"
            :class="{ 'bg-[#A1842C]': selectedNote.id === note.id,
                      'hover:bg-[#A1842C]/50': selectedNote.id !== note.id,
            }"
            @click="selectedNote = note"
          >
            <h3 class="text-sm font-bold text-[#F4F4F5] truncate">
              {{ note.text.substring(0, 40) }}
            </h3>
            <div class="leading-none text-[#C2C2C5] truncate">
              <span class="text-xs text-[#F4F4F5] mr-4">
                {{ new Date(note.updated_at).toDateString()
                  === new Date().toDateString()
                  ? 'Today'
                  : new Date(note.updated_at).toLocaleDateString() }}
              </span>
              <span class="text-xs text-[#C2C2C5]">...{{ note.text.substring(40, 90) }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- /today container -->
      <!-- yesterday container -->
      <div>
        <p class="text-sm font-bold text-[#C2C2C5] mb-6 mt-12">
          Yesterday
        </p>
        <div
          class="ml-2 space-y-2"
        >
          <div
            v-for="note in yesterdaysNotes" class="p-2 rounded-lg cursor-pointer"
            :class="{ 'bg-[#A1842C]': selectedNote.id === note.id,
                      'hover:bg-[#A1842C]/50': selectedNote.id !== note.id,
            }"
            @click="selectedNote = note"
          >
            <h3 class="text-sm font-bold text-[#F4F4F5] truncate">
              {{ note.text.substring(0, 40) }}
            </h3>
            <div class="leading-none text-[#C2C2C5] truncate">
              <span class="text-xs text-[#F4F4F5] mr-4">
                {{ new Date(note.updated_at).toDateString()
                  === new Date().toDateString()
                  ? 'Today'
                  : new Date(note.updated_at).toLocaleDateString() }}
              </span>
              <span class="text-xs text-[#C2C2C5]">...{{ note.text.substring(40, 90) }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- /yesterday container -->
      <!-- past 30 days container -->
      <div>
        <p class="text-sm font-bold text-[#C2C2C5] mb-6 mt-12">
          Earlier
        </p>
        <div
          class="ml-2 space-y-2"
        >
          <div
            v-for="note in earlierNotes" class="p-2 rounded-lg cursor-pointer"
            :class="{ 'bg-[#A1842C]': selectedNote.id === note.id,
                      'hover:bg-[#A1842C]/50': selectedNote.id !== note.id,
            }"
            @click="selectedNote = note"
          >
            <h3 class="text-sm font-bold text-[#F4F4F5] truncate">
              {{ note.text.substring(0, 40) }}
            </h3>
            <div class="leading-none text-[#C2C2C5] truncate">
              <span class="text-xs text-[#F4F4F5] mr-4">
                {{ new Date(note.updated_at).toDateString()
                  === new Date().toDateString()
                  ? 'Today'
                  : new Date(note.updated_at).toLocaleDateString() }}
              </span>
              <span class="text-xs text-[#C2C2C5]">...{{ note.text.substring(40, 90) }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- /past 30 days container -->
    </div>
    <!-- /sidebar -->
    <!-- button container -->
    <div class="w-full">
      <div class="flex justify-between w-full items-start p-8">
        <button class="inline-flex text-sx text-[#C2C2C5] hover:text-white items-center gap-2">
          <PencilIcon />
          Create note
        </button>
        <button class="text-[#6D6D73] hover:text-white">
          <TrashIcon />
        </button>
      </div>
      <!-- /button container -->
      <!-- note container -->
      <div class="max-w-[437px] mx-auto">
        <p class="text-[#929292] playfair">
          {{ new Date(selectedNote.updated_at).toLocaleDateString() }}
        </p>
        <p class="text-[#D4D4D4] my-4 playfair note">
          {{ selectedNote.text }}
        </p>
      </div>
    </div>
    <!-- /note container -->
  </div>
</template>

<style scoped>
.note {
  white-space: pre-line; /* Preserves newlines, collapses multiple spaces */
}
</style>
