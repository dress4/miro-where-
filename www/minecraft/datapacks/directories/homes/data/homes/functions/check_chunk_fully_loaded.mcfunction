summon minecraft:area_effect_cloud ~ ~ ~ {Tags:["homes.checkChunkFullyLoaded"]}
execute if entity @e[type=minecraft:area_effect_cloud,tag=homes.checkChunkFullyLoaded,limit=1,distance=..0.01] run function homes:start_to_mark_dimension