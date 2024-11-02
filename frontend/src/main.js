import './app.css';
import { mount } from 'svelte';
import App from './App.svelte';

// Monta o componente na div com ID 'app'
mount(App, {
  target: document.getElementById('app'),
});
