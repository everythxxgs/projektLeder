import { writable } from 'svelte/store';

export const currentView = writable('search');
export const selectedCourse = writable(null);