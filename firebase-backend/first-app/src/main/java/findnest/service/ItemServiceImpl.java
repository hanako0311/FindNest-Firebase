package findnest.service;

import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import findnest.model.Items;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.Map;

@Service
public class ItemServiceImpl implements ItemService {

    private final DatabaseReference dbRef;
    private final DatabaseReference historyDbRef;

    public ItemServiceImpl() {
        this.dbRef = FirebaseDatabase.getInstance().getReference("items");
        this.historyDbRef = FirebaseDatabase.getInstance().getReference("ItemsHistory");
    }

    @Override
    public Items saveItem(Items item) {
        String id = dbRef.push().getKey();
        item.setId(id);
        String timestamp = Instant.now().toString();
        item.setCreatedAt(timestamp);
        item.setUpdatedAt(timestamp);
        item.setStatus("Available");

        // Ensure `foundByName` and `staffInvolved` are initialized if null
        if (item.getFoundByName() == null || item.getFoundByName().isEmpty()) {
            item.setFoundByName("Unknown");
        }
        if (item.getStaffInvolved() == null || item.getStaffInvolved().isEmpty()) {
            item.setStaffInvolved("Unassigned");
        }

        dbRef.child(id).setValueAsync(item);

        return item;
    }

    @Override
    public Items getItemById(String id) {
        CompletableFuture<Items> future = new CompletableFuture<>();
        dbRef.child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                if (snapshot.exists()) {
                    future.complete(snapshot.getValue(Items.class));
                } else {
                    future.complete(null);
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });

        try {
            return future.get();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public List<Items> getAllItems() {
        CompletableFuture<List<Items>> future = new CompletableFuture<>();
        dbRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                List<Items> itemsList = new ArrayList<>();
                if (snapshot.exists()) {
                    for (DataSnapshot childSnapshot : snapshot.getChildren()) {
                        Items item = childSnapshot.getValue(Items.class);
                        itemsList.add(item);
                    }
                }
                future.complete(itemsList);
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });

        try {
            return future.get();
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public Items updateItem(String id, Items updatedItem) {
        CompletableFuture<Items> future = new CompletableFuture<>();

        dbRef.child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                if (snapshot.exists()) {
                    Items existingItem = snapshot.getValue(Items.class);
                    if (existingItem != null) {
                        // Preserve fields that are not being updated
                        if (updatedItem.getTurnoverDate() == null) {
                            updatedItem.setTurnoverDate(existingItem.getTurnoverDate());
                        }
                        if (updatedItem.getTurnoverPerson() == null) {
                            updatedItem.setTurnoverPerson(existingItem.getTurnoverPerson());
                        }
                        if (updatedItem.getFoundByName() == null) {
                            updatedItem.setFoundByName(existingItem.getFoundByName());
                        }
                        if (updatedItem.getStaffInvolved() == null) {
                            updatedItem.setStaffInvolved(existingItem.getStaffInvolved());
                        }

                        // Set the ID and updated timestamp
                        updatedItem.setId(id);
                        updatedItem.setUpdatedAt(Instant.now().toString());

                        // Save the updated item
                        dbRef.child(id).setValueAsync(updatedItem);
                        future.complete(updatedItem);
                    } else {
                        future.complete(null);
                    }
                } else {
                    future.complete(null);
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });

        try {
            return future.get();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public void deleteItem(String id) {
        dbRef.child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                if (snapshot.exists()) {
                    Items item = snapshot.getValue(Items.class);
                    if (item != null) {
                        saveToItemsHistory(item);
                    }
                    dbRef.child(id).removeValueAsync();
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                error.toException().printStackTrace();
            }
        });
    }

    @Override
    public void saveToItemsHistory(Items item) {
        String historyId = historyDbRef.push().getKey();
        item.setId(historyId);
        historyDbRef.child(historyId).setValueAsync(item);
    }

    @Override
    public List<Items> getAllItemsFromHistory() {
        CompletableFuture<List<Items>> future = new CompletableFuture<>();
        historyDbRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                List<Items> itemsList = new ArrayList<>();
                if (snapshot.exists()) {
                    for (DataSnapshot childSnapshot : snapshot.getChildren()) {
                        Items item = childSnapshot.getValue(Items.class);
                        itemsList.add(item);
                    }
                }
                future.complete(itemsList);
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });

        try {
            return future.get();
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public Items getItemFromHistoryById(String id) {
        CompletableFuture<Items> future = new CompletableFuture<>();
        historyDbRef.child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                if (snapshot.exists()) {
                    future.complete(snapshot.getValue(Items.class));
                } else {
                    future.complete(null);
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });

        try {
            return future.get();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public Items countAllItems() {
        CompletableFuture<Items> future = new CompletableFuture<>();
        dbRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                Items itemCounts = new Items();
                itemCounts.setTotalCount(snapshot.getChildrenCount());
                long availableCount = 0;
                long claimedCount = 0;

                for (DataSnapshot childSnapshot : snapshot.getChildren()) {
                    String status = childSnapshot.child("status").getValue(String.class);
                    if ("Available".equalsIgnoreCase(status)) {
                        availableCount++;
                    } else if ("Claimed".equalsIgnoreCase(status)) {
                        claimedCount++;
                    }
                }

                itemCounts.setAvailableCount(availableCount);
                itemCounts.setClaimedCount(claimedCount);
                future.complete(itemCounts);
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });

        try {
            return future.get();
        } catch (Exception e) {
            e.printStackTrace();
            return new Items();
        }
    }

    @Override
    public Items patchItem(String id, Map<String, Object> updates) {
        CompletableFuture<Items> future = new CompletableFuture<>();
        dbRef.child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                if (snapshot.exists()) {
                    Items item = snapshot.getValue(Items.class);
                    if (item != null) {
                        if (!"Claimed".equalsIgnoreCase(item.getStatus())) {
                            item.setStatus("Claimed");
                            item.setClaimedDate(Instant.now().toString());
                        }
                        updates.forEach((key, value) -> {
                            switch (key) {
                                case "claimantName":
                                    item.setClaimantName((String) value);
                                    break;
                                case "claimantImage":
                                    item.setClaimantImage((String) value);
                                    break;
                                case "userRef":
                                    item.setUserRef((String) value);
                                    break;
                                case "foundByName": // Added case for `foundByName`
                                    item.setFoundByName((String) value);
                                    break;
                                case "staffInvolved": // Added case for `staffInvolved`
                                    item.setStaffInvolved((String) value);
                                    break;
                            }
                        });

                        item.setUpdatedAt(Instant.now().toString());
                        dbRef.child(id).setValueAsync(item);
                        future.complete(item);
                    } else {
                        future.complete(null);
                    }
                } else {
                    future.complete(null);
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });

        try {
            return future.get();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public Items updateTurnoverDetails(String id, String turnoverDate, String turnoverPerson, String department) {
        CompletableFuture<Items> future = new CompletableFuture<>();
        dbRef.child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                if (snapshot.exists()) {
                    Items item = snapshot.getValue(Items.class);
                    if (item != null) {
                        // Update the turnoverDate, turnoverPerson, and department
                        item.setTurnoverDate(turnoverDate);
                        item.setTurnoverPerson(turnoverPerson);
                        item.setDepartment(department);

                        // Set the updated timestamp
                        item.setUpdatedAt(Instant.now().toString());

                        // Save the updated item back to the database
                        dbRef.child(id).setValueAsync(item);
                        future.complete(item);
                    } else {
                        future.complete(null);
                    }
                } else {
                    future.complete(null);
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });

        try {
            return future.get();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}