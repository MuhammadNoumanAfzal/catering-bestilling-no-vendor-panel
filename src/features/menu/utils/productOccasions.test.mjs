import test from 'node:test';
import assert from 'node:assert/strict';
import { occasionIds, productOccasionInput } from './productOccasions.js';
test('single products retain, deduplicate and clear selected occasions',()=>{assert.deepEqual(occasionIds([{id:'wedding'}, {id:'wedding'}, {id:'birthday'}]),['wedding','birthday']);assert.deepEqual(productOccasionInput({addOnType:'INDEPENDENT',selectedOccasions:['wedding','wedding','asian-event']}),{occasions:['wedding','asian-event']});assert.deepEqual(productOccasionInput({addOnType:'INDEPENDENT',selectedOccasions:[]}),{occasions:[]});assert.deepEqual(occasionIds(null),[])});
test('dependent add-ons do not acquire or overwrite occasion assignments',()=>{assert.deepEqual(productOccasionInput({addOnType:'DEPENDENT',selectedOccasions:['wedding']}),{});});

test('persisted GraphQL connection occasions survive editing',()=>{assert.deepEqual(occasionIds({edges:[{node:{id:'wedding'}},{node:{id:'birthday'}}]}),['wedding','birthday']);});
