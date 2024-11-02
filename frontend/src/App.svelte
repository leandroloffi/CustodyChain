<script>
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    let id, who, what, when, where, why, how;
    let assets = [];
    let view = writable("home");
    let transferId, newOwner;

    async function fetchAssets() {
		try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch("http://34.41.10.244:3000/assets", { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error("Erro ao buscar ativos");
    assets = await response.json();
  } catch (error) {
    console.error("Erro de conexão:", error);
  }
		  
	}
  

    async function createview() {
      view.set("create");
    }

   async function transferAsset() {
    try {
      const response = await fetch("http://34.41.10.244:3000/transferAsset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: transferId, newOwner })
      });
      if (response.ok) {
        alert("Transfer of ownership completed successfully!");
        view.set("home");
      } else {
        alert("Error transferring ownership.");
      }
    } catch (error) {
      alert("Connection error when transferring ownership.");
    }
  }

    async function createAsset() {
        const response = await fetch("http://34.41.10.244:3000/asset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, who, what, when, where, why, how })
        });
	if (response.ok) {
	alert("Asset created successfully!");
	view.set("home");
	} else {
	alert("Error creating asset.");
	}
    }
    
    function showAssets() {
      view.set("view");
      fetchAssets();
    }

    
</script>

<main>
  {#if $view === "home"}
    <h1>Choose an action:</h1>
    <button on:click={createview}>Create Asset</button>
    <button on:click={showAssets}>View All Assets</button>
    <button on:click={() => view.set("transfer")}>Transfer Custody</button>
  {:else if $view === "create"}
    <!-- Interface para criação do ativo -->
    <h2>Create Asset</h2>
    <form on:submit|preventDefault={createAsset}>
      <input type="text" placeholder="ID" bind:value={id} required />
      <input type="text" placeholder="Who" bind:value={who} required />
      <input type="text" placeholder="What" bind:value={what} required />
      <input type="text" placeholder="When" bind:value={when} required />
      <input type="text" placeholder="Where" bind:value={where} required />
      <input type="text" placeholder="Why" bind:value={why} required />
      <input type="text" placeholder="How" bind:value={how} required />
      <button type="submit">Create</button>
    </form>
    <button on:click={() => view.set("home")}>Back</button>
  {:else if $view === "view"}
    <!-- Interface para exibição dos ativos -->
    <h2>View All Assets</h2>
      <table border="1" style="margin-bottom: 1rem; width: 100%;">
        <thead>
          <tr>
            <th>ID</th>
            <th>Who</th>
            <th>What</th>
            <th>When</th>
            <th>Where</th>
            <th>Why</th>
            <th>How</th>
          </tr>
        </thead>
        {#each assets as asset}
        <tbody>
          <tr>
            <td>{asset.ID}</td>
            <td>{asset.Who}</td>
            <td>{asset.What}</td>
            <td>{asset.When}</td>
            <td>{asset.Where}</td>
            <td>{asset.Why}</td>
            <td>{asset.How}</td>
          </tr>
        </tbody>
        {/each}
      </table>
    <button on:click={() => view.set("home")}>Back</button>
    {:else if $view === "transfer"}
    <h2>Transfer Custody</h2>
    <form on:submit|preventDefault={transferAsset}>
      <input type="text" placeholder="ID" bind:value={transferId} required />
      <input type="text" placeholder="New Owner" bind:value={newOwner} required />
      <button type="submit">Transfer</button>
    </form>
    <button on:click={() => view.set("home")}>Back</button>
  {/if}
</main>
