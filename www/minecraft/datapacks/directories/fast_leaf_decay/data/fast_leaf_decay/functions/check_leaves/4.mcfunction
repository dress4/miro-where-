execute positioned ~ ~-1 ~ if predicate fast_leaf_decay:leaves/4 unless entity @e[type=minecraft:item_frame,tag=leafDec.marker,dx=0,dy=0,dz=0] run function fast_leaf_decay:iterate
execute positioned ~ ~1 ~ if predicate fast_leaf_decay:leaves/4 unless entity @e[type=minecraft:item_frame,tag=leafDec.marker,dx=0,dy=0,dz=0] run function fast_leaf_decay:iterate
execute positioned ~-1 ~ ~ if predicate fast_leaf_decay:leaves/4 unless entity @e[type=minecraft:item_frame,tag=leafDec.marker,dx=0,dy=0,dz=0] run function fast_leaf_decay:iterate
execute positioned ~1 ~ ~ if predicate fast_leaf_decay:leaves/4 unless entity @e[type=minecraft:item_frame,tag=leafDec.marker,dx=0,dy=0,dz=0] run function fast_leaf_decay:iterate
execute positioned ~ ~ ~-1 if predicate fast_leaf_decay:leaves/4 unless entity @e[type=minecraft:item_frame,tag=leafDec.marker,dx=0,dy=0,dz=0] run function fast_leaf_decay:iterate
execute positioned ~ ~ ~1 if predicate fast_leaf_decay:leaves/4 unless entity @e[type=minecraft:item_frame,tag=leafDec.marker,dx=0,dy=0,dz=0] run function fast_leaf_decay:iterate