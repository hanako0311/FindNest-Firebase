package findnest.controller;

import findnest.model.Items;
import findnest.service.ItemService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;

    @Autowired
    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @PostMapping("/save")
    public Items saveItem(@RequestBody Items item) {
        return itemService.saveItem(item);
    }

    @GetMapping("/{id}")
    public Items getItemById(@PathVariable String id) {
        return itemService.getItemById(id);
    }

    @GetMapping
    public List<Items> getAllItems() {
        return itemService.getAllItems();
    }

    @PutMapping("/{id}")
    public Items updateItem(@PathVariable String id, @RequestBody Items item) {
        return itemService.updateItem(id, item);
    }

    @DeleteMapping("/{id}")
    public void deleteItem(@PathVariable String id) {
        itemService.deleteItem(id);
    }

    @GetMapping("/history")
    public List<Items> getAllItemsFromHistory() {
        return itemService.getAllItemsFromHistory();
    }

    @GetMapping("/history/{id}")
    public Items getItemFromHistoryById(@PathVariable String id) {
        return itemService.getItemFromHistoryById(id);
    }

    @GetMapping("/count")
    public Items countAllItems() {
        return itemService.countAllItems();
    }

    @PatchMapping("/{id}")
    public Items patchItem(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        return itemService.patchItem(id, updates);
    }

}
