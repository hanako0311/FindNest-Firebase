package findnest.service;

import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.api.core.ApiFuture;
import com.google.api.core.ApiFutureCallback;
import com.google.api.core.ApiFutures;
import com.google.common.util.concurrent.MoreExecutors;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.ValueEventListener;
import com.google.firebase.auth.UserRecord;
import findnest.model.User;
import org.springframework.stereotype.Service;
import com.google.firebase.database.DatabaseReference.CompletionListener;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.List;
import java.util.ArrayList;
import java.time.Instant;



@Service
public class UserServiceImpl implements UserService {

    private final DatabaseReference databaseReference;
    private final FirebaseAuth firebaseAuth;

    public UserServiceImpl() {
        this.databaseReference = FirebaseDatabase.getInstance().getReference("users");
        this.firebaseAuth = FirebaseAuth.getInstance();
    }

    @Override
    public User createUser(User user) {
        // Create user in Firebase Authentication
        UserRecord.CreateRequest createRequest = new UserRecord.CreateRequest()
                .setEmail(user.getEmail())
                .setPassword(user.getPassword())
                .setDisplayName(user.getFirstName() + " " + user.getLastName());
    
        try {
            UserRecord firebaseUser = firebaseAuth.createUser(createRequest);
            user.setId(firebaseUser.getUid()); // Set the UID from Firebase Auth
    
            // Get current timestamp as a formatted string
            String timestamp = Instant.now().toString(); // You can use a different format if preferred
    
            // Set the timestamps
            user.setCreatedAt(timestamp);
            user.setUpdatedAt(timestamp);
            user.setPassword(null);
            // Save user details to Firebase Realtime Database
            databaseReference.child(user.getId()).setValue(user, new DatabaseReference.CompletionListener() {
                @Override
                public void onComplete(DatabaseError error, DatabaseReference ref) {
                    if (error != null) {
                        System.err.println("Error saving user data: " + error.getMessage());
                        throw new RuntimeException("Error saving user data", error.toException());
                    } else {
                        System.out.println("User data saved successfully.");
                    }
                }
            });
    
            return user;
        } catch (FirebaseAuthException e) {
            throw new RuntimeException("Error creating Firebase user", e);
        }
    }
    

    @Override
    public User getUserById(String id) {
        CompletableFuture<User> future = new CompletableFuture<>();

        databaseReference.child(id).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                if (snapshot.exists()) {
                    User user = snapshot.getValue(User.class);
                    future.complete(user);
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
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error retrieving user", e);
        }
    }

    @Override
    public List<User> getAllUsers() {
        CompletableFuture<List<User>> future = new CompletableFuture<>();

        databaseReference.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                List<User> users = new ArrayList<>();
                for (DataSnapshot userSnapshot : snapshot.getChildren()) {
                    User user = userSnapshot.getValue(User.class);
                    users.add(user);
                }
                future.complete(users);
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });

        try {
            return future.get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error retrieving users", e);
        }
    }

    @Override
    public User updateUser(User user) {
        String timestamp = Instant.now().toString();
        user.setUpdatedAt(timestamp);
    
        // Update user details in Firebase Realtime Database
        databaseReference.child(user.getId()).setValueAsync(user);
    
        // If a new password is provided, update it in Firebase Authentication
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            try {
                UserRecord userRecord = firebaseAuth.getUser(user.getId());
                UserRecord.UpdateRequest updateRequest = new UserRecord.UpdateRequest(user.getId())
                        .setPassword(user.getPassword());
    
                firebaseAuth.updateUser(updateRequest);
                System.out.println("Password updated successfully.");
            } catch (FirebaseAuthException e) {
                throw new RuntimeException("Error updating user password in Firebase Authentication", e);
            }
        }
    
        return user;
    }
    

    @Override
    public void deleteUser(String id) {
        // Delete user from Firebase Authentication
        try {
            firebaseAuth.deleteUser(id); // This deletes the user from Firebase Authentication
        } catch (FirebaseAuthException e) {
            throw new RuntimeException("Error deleting user from Firebase Authentication", e);
        }

        // Delete user from Firebase Realtime Database
        ApiFuture<Void> future = databaseReference.child(id).removeValueAsync();

        ApiFutures.addCallback(future, new ApiFutureCallback<Void>() {
            @Override
            public void onSuccess(Void result) {
                System.out.println("User data removed from Realtime Database successfully.");
            }

            @Override
            public void onFailure(Throwable t) {
                System.err.println("Error removing user data from Realtime Database: " + t.getMessage());
            }
        }, MoreExecutors.directExecutor());
    }

    
    
    @Override
    public int getUserCount() {
        CompletableFuture<Integer> future = new CompletableFuture<>();
    
        databaseReference.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                int userCount = (int) snapshot.getChildrenCount();
                future.complete(userCount);
            }
    
            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });
    
        try {
            return future.get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error retrieving user count", e);
        }
    }

    @Override
    public void updateProfilePicture(String id, String profilePictureUrl) {
        // Reference to the specific user node in the database
        DatabaseReference userRef = databaseReference.child(id).child("profilePicture");

        // Set the profile picture URL asynchronously
        ApiFuture<Void> future = userRef.setValueAsync(profilePictureUrl);

        ApiFutures.addCallback(future, new ApiFutureCallback<Void>() {
            @Override
            public void onSuccess(Void result) {
                System.out.println("Profile picture updated successfully.");
            }

            @Override
            public void onFailure(Throwable t) {
                System.err.println("Error updating profile picture: " + t.getMessage());
            }
        }, MoreExecutors.directExecutor());
    }
}
