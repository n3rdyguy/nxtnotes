<script setup>
import Swal from "sweetalert2";

const email = ref();
const password = ref();

async function submit() {
  try {
    await $fetch("/api/user", {
      method: "POST",
      body: {
        email: email.value,
        password: password.value,
      },
    });
    const { isConfirmed } = await Swal.fire({
      title: "Success!",
      text: "User created successfully!",
      icon: "success",
      confirmButtonText: "Log me in",
      theme: "auto",
    });
    if (isConfirmed) {
      navigateTo("/");
    }
  }
  catch (error) {
    Swal.fire({
      title: "Error!",
      text: error.response?._data.message,
      icon: "error",
      confirmButtonText: "OK",
      theme: "auto",
    });
  }
}
</script>

<template>
  <div class="flex bg-zinc-50 dark:bg-black h-screen">
    <!-- sidebar -->
    <div class="bg-white dark:bg-zinc-900 w-[516px] p-16 flex flex-col justify-center">
      <Logo />
      <h1 class="text-zinc-900 dark:text-white font-bold text-lg mt-8">
        Sign up for a free account
      </h1>
      <p class="text-zinc-600 dark:text-zinc-300 text-sm mt-0.5 mb-12">
        Already registered?
        <NuxtLink to="/login">
          <span class="font-bold text-brand underline cursor-pointer">Log in</span> to your account
        </NuxtLink>
      </p>
      <form @submit.prevent="submit">
        <div class="mb-8">
          <label for="email" class="text-zinc-600 dark:text-zinc-300 text-sm block mb-0.5">Email Address</label>
          <input id="email" v-model="email" type="email" name="email" autocomplete="email" placeholder="your@email.com" class="w-full bg-white dark:bg-[#27272A] border border-zinc-300 dark:border-[#3F3F46] rounded text-zinc-900 dark:text-white p-2 placeholder:text-zinc-500 text-sm">
        </div>
        <div class="mb-8">
          <label for="password" class="text-zinc-600 dark:text-zinc-300 text-sm block mb-0.5">Password</label>
          <input id="password" v-model="password" type="password" name="password" autocomplete="current-password" placeholder="**********************" class="w-full bg-white dark:bg-[#27272A] border border-zinc-300 dark:border-[#3F3F46] rounded text-zinc-900 dark:text-white p-2 placeholder:text-zinc-500 text-sm">
        </div>
        <div>
          <button class="flex justify-center gap-2 items-center w-full bg-brand text-white rounded-full px-4 py-2">
            Sign Up
            <ArrowRight />
          </button>
        </div>
      </form>
    </div>
    <!-- end sidebar -->
    <!-- note intro -->
    <!-- /note intro -->
  </div>
</template>
