package findnest.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Items {
    private String id;
    private String userRef;
    private String item;
    private String dateFound;
    private String location;
    private String description;
    private List<String> imageUrls;
    private String category;
    private String status;
    private String claimantName;
    private String department;
    private String createdAt;
    private String updatedAt;
    private String claimedDate;
    private String claimantImage; // URL of the image for the claimant

    // Added turnoverDate and turnoverPerson fields
    private String turnoverDate; 
    private String turnoverPerson;

    private long totalCount;
    private long availableCount;    
    private long claimedCount;

    // Newly added fields
    private String foundByName; // Name of the person who found the item
    private String staffInvolved; // Name of the staff involved in the process
}