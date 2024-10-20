package findnest.service;

import findnest.model.Items;
import java.util.List;
import java.util.Map;

public interface ItemService {
    Items saveItem(Items item);
    Items getItemById(String id);
    List<Items> getAllItems();
    Items updateItem(String id, Items item);
    void deleteItem(String id);
    void saveToItemsHistory(Items item);
    List<Items> getAllItemsFromHistory();
    Items getItemFromHistoryById(String id); 
    Items countAllItems();
    Items patchItem(String id, Map<String, Object> updates);

    Items updateTurnoverDetails(String id, String turnoverDate, String turnoverPerson, String department);

}