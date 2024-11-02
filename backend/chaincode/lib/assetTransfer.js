'use strict';

const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {

    async InitLedger(ctx) {
        const assets = [
            {
                ID: '1',
                Who: 'Tomoko',
                What: 'Initial storage',
                When: new Date().toISOString(),
                Where: 'Location A',
                Why: 'Evidence collection',
                How: 'Sealed bag',
            },
        ];

        for (const asset of assets) {
            asset.docType = 'asset';
            await ctx.stub.putState(asset.ID, Buffer.from(stringify(sortKeysRecursive(asset))));
        }
    }

    async GetAllAssets(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }


    async CreateAsset(ctx, id, who, what, when, where, why, how) {
        const exists = await this.AssetExists(ctx, id);
        if (exists) {
            throw new Error(`The asset ${id} already exists`);
        }

        const asset = { ID: id, Who: who, What: what, When: when, Where: where, Why: why, How: how };
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        return JSON.stringify(asset);
    }

    async UpdateAsset(ctx, id, who, what, when, where, why, how) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        const updatedAsset = { ID: id, Who: who, What: what, When: when, Where: where, Why: why, How: how };
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(updatedAsset))));
        return JSON.stringify(updatedAsset);
    }

    async TransferAsset(ctx, id, newOwner) {
      const exists = await this.AssetExists(ctx, id);
      if (!exists) {
        throw new Error(`The asset ${id} does not exist`);
      }

      const assetJSON = await ctx.stub.getState(id);
      const asset = JSON.parse(assetJSON.toString());

      asset.Who = newOwner;
      asset.When = new Date().toISOString();

      await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
      return JSON.stringify(asset);
    }

    async AssetExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

}

module.exports = AssetTransfer;
