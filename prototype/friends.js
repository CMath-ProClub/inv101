// Friends Page JavaScript

const API_BASE = 'http://localhost:3000/api';
let currentUser = null;
let searchTimeout = null;
let selectedFriend = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Load user info
    await loadUserInfo();
    
    // Load initial data
    await loadFriends();
    await loadRequests('received');
    await loadRequests('sent');
});

// Load user information
async function loadUserInfo() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/user-profile/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            document.getElementById('userInfo').innerHTML = `
                <span class="text-gray-700 font-medium">${data.user.username}</span>
                <span class="text-sm text-gray-500">Level ${data.level || 1}</span>
            `;
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

// Search users
async function searchUsers() {
    const query = document.getElementById('searchInput').value.trim();
    const resultsDiv = document.getElementById('searchResults');

    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    if (query.length < 2) {
        resultsDiv.classList.add('hidden');
        return;
    }

    // Debounce search
    searchTimeout = setTimeout(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/friends/search?q=${encodeURIComponent(query)}&limit=10`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                displaySearchResults(data.users);
            }
        } catch (error) {
            console.error('Error searching users:', error);
        }
    }, 300);
}

// Display search results
function displaySearchResults(users) {
    const resultsDiv = document.getElementById('searchResults');
    
    if (users.length === 0) {
        resultsDiv.innerHTML = '<p class="text-gray-500 text-center py-4">No users found</p>';
        resultsDiv.classList.remove('hidden');
        return;
    }

    resultsDiv.innerHTML = users.map(user => {
        // Don't show current user
        if (user._id === currentUser._id) return '';

        return `
            <div class="search-result flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        ${user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div class="font-semibold text-gray-900">${user.username}</div>
                        <div class="text-sm text-gray-500">Level ${user.level || 1}</div>
                    </div>
                </div>
                <button 
                    onclick="sendFriendRequest('${user._id}', '${user.username}')"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
                    ${user.friendStatus ? 'disabled' : ''}
                >
                    ${user.friendStatus === 'friends' ? '✓ Friends' : 
                      user.friendStatus === 'pending' ? '⏳ Pending' : 
                      user.friendStatus === 'sent' ? '📤 Sent' : 
                      '➕ Add Friend'}
                </button>
            </div>
        `;
    }).join('');

    resultsDiv.classList.remove('hidden');
}

// Send friend request
async function sendFriendRequest(receiverId, username) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/friends/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                senderId: currentUser._id,
                receiverId: receiverId
            })
        });

        if (response.ok) {
            alert(`Friend request sent to ${username}!`);
            await loadRequests('sent');
            document.getElementById('searchInput').value = '';
            document.getElementById('searchResults').classList.add('hidden');
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to send friend request');
        }
    } catch (error) {
        console.error('Error sending friend request:', error);
        alert('Failed to send friend request');
    }
}

// Switch tabs
function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`tab-${tab}`).classList.add('active');

    // Show/hide tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(`${tab}Tab`).classList.remove('hidden');

    // Load data if needed
    if (tab === 'friends') {
        loadFriends();
    } else if (tab === 'received') {
        loadRequests('received');
    } else if (tab === 'sent') {
        loadRequests('sent');
    }
}

// Load friends list
async function loadFriends() {
    const loadingDiv = document.getElementById('friendsLoading');
    const listDiv = document.getElementById('friendsList');
    const noFriendsDiv = document.getElementById('noFriends');

    loadingDiv.classList.remove('hidden');
    listDiv.classList.add('hidden');
    noFriendsDiv.classList.add('hidden');

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/friends/${currentUser._id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('friendsCount').textContent = data.friends.length;

            loadingDiv.classList.add('hidden');

            if (data.friends.length === 0) {
                noFriendsDiv.classList.remove('hidden');
            } else {
                listDiv.innerHTML = data.friends.map(friend => createFriendCard(friend)).join('');
                listDiv.classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error('Error loading friends:', error);
        loadingDiv.classList.add('hidden');
    }
}

// Create friend card
function createFriendCard(friend) {
    return `
        <div class="friend-card bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div class="flex items-center space-x-3 mb-4">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    ${friend.username.charAt(0).toUpperCase()}
                </div>
                <div class="flex-1">
                    <div class="font-bold text-lg text-gray-900">${friend.username}</div>
                    <div class="text-sm text-gray-500">Level ${friend.level || 1}</div>
                </div>
            </div>
            
            <div class="space-y-2">
                <button 
                    onclick="openChallengeModal('${friend._id}', '${friend.username}')"
                    class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                    ⚔️ Challenge
                </button>
                <button 
                    onclick="viewProfile('${friend._id}')"
                    class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition"
                >
                    <span class="icon" data-icon="user"></span> View Profile
                </button>
                <button 
                    onclick="removeFriend('${friend._id}', '${friend.username}')"
                    class="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-lg transition text-sm"
                >
                    Remove Friend
                </button>
            </div>
        </div>
    `;
}

// Load friend requests
async function loadRequests(type) {
    const loadingDiv = document.getElementById(`${type}Loading`);
    const listDiv = document.getElementById(`${type}List`);
    const noRequestsDiv = document.getElementById(`no${type.charAt(0).toUpperCase() + type.slice(1)}`);

    loadingDiv.classList.remove('hidden');
    listDiv.classList.add('hidden');
    noRequestsDiv.classList.add('hidden');

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/friends/requests/${currentUser._id}?type=${type}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById(`${type}Count`).textContent = data.requests.length;

            loadingDiv.classList.add('hidden');

            if (data.requests.length === 0) {
                noRequestsDiv.classList.remove('hidden');
            } else {
                listDiv.innerHTML = data.requests.map(request => createRequestCard(request, type)).join('');
                listDiv.classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error(`Error loading ${type} requests:`, error);
        loadingDiv.classList.add('hidden');
    }
}

// Create request card
function createRequestCard(request, type) {
    const otherUser = type === 'received' ? request.sender : request.receiver;
    const timeAgo = getTimeAgo(new Date(request.createdAt));

    return `
        <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        ${otherUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div class="font-semibold text-gray-900">${otherUser.username}</div>
                        <div class="text-sm text-gray-500">${timeAgo}</div>
                    </div>
                </div>
                <span class="badge ${type === 'sent' ? 'badge-sent' : 'badge-pending'}">
                    ${type === 'sent' ? '📤 Sent' : '📥 Received'}
                </span>
            </div>
            
            ${request.message ? `<p class="text-gray-600 text-sm mb-3">"${request.message}"</p>` : ''}
            
            <div class="flex space-x-2">
                ${type === 'received' ? `
                    <button 
                        onclick="acceptRequest('${request.requestId}')"
                        class="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition"
                    >
                        ✓ Accept
                    </button>
                    <button 
                        onclick="declineRequest('${request.requestId}')"
                        class="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition"
                    >
                        ✗ Decline
                    </button>
                ` : `
                    <button 
                        onclick="cancelRequest('${request.requestId}')"
                        class="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition"
                    >
                        Cancel Request
                    </button>
                `}
            </div>
        </div>
    `;
}

// Accept friend request
async function acceptRequest(requestId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/friends/request/${requestId}/accept`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId: currentUser._id })
        });

        if (response.ok) {
            alert('Friend request accepted!');
            await loadFriends();
            await loadRequests('received');
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to accept request');
        }
    } catch (error) {
        console.error('Error accepting request:', error);
        alert('Failed to accept request');
    }
}

// Decline friend request
async function declineRequest(requestId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/friends/request/${requestId}/decline`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId: currentUser._id })
        });

        if (response.ok) {
            alert('Friend request declined');
            await loadRequests('received');
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to decline request');
        }
    } catch (error) {
        console.error('Error declining request:', error);
        alert('Failed to decline request');
    }
}

// Cancel friend request
async function cancelRequest(requestId) {
    if (!confirm('Cancel this friend request?')) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/friends/request/${requestId}/cancel`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId: currentUser._id })
        });

        if (response.ok) {
            alert('Friend request cancelled');
            await loadRequests('sent');
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to cancel request');
        }
    } catch (error) {
        console.error('Error cancelling request:', error);
        alert('Failed to cancel request');
    }
}

// Remove friend
async function removeFriend(friendId, username) {
    if (!confirm(`Remove ${username} from your friends?`)) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/friends/${currentUser._id}/${friendId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert(`${username} removed from friends`);
            await loadFriends();
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to remove friend');
        }
    } catch (error) {
        console.error('Error removing friend:', error);
        alert('Failed to remove friend');
    }
}

// Open challenge modal
function openChallengeModal(friendId, username) {
    selectedFriend = { id: friendId, username: username };
    document.getElementById('challengeFriendName').textContent = username;
    document.getElementById('challengeModal').classList.remove('hidden');
}

// Close challenge modal
function closeChallengeModal() {
    selectedFriend = null;
    document.getElementById('challengeModal').classList.add('hidden');
}

// Send challenge
async function sendChallenge(gameMode) {
    if (!selectedFriend) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/battles/challenge/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                challengerId: currentUser._id,
                challengedId: selectedFriend.id,
                gameMode: gameMode
            })
        });

        if (response.ok) {
            alert(`Challenge sent to ${selectedFriend.username}!`);
            closeChallengeModal();
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to send challenge');
        }
    } catch (error) {
        console.error('Error sending challenge:', error);
        alert('Failed to send challenge');
    }
}

// View profile (placeholder)
function viewProfile(userId) {
    // TODO: Implement profile viewing
    alert('Profile viewing coming soon!');
}

// Helper function to get time ago
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = 'login.html';
}
