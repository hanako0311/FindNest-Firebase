import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Modal, Table, Button, TextInput, Toast, Avatar } from 'flowbite-react';
import {
  HiOutlineExclamationCircle,
  HiTrash,
  HiPlus,
  HiPencilAlt,
  HiCheckCircle,
  HiXCircle,
} from 'react-icons/hi';
import { AiOutlineSearch } from 'react-icons/ai';
import UserModal from '../reusable/UserModal'; // Import UserModal

const departments = ['SSG', 'SSO', 'SSD'];

export default function DashUsers() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userIdToDelete, setUserIdToDelete] = useState('');
  const [toastMessage, setToastMessage] = useState(null); // Unified toast message state
  const [toastType, setToastType] = useState(''); // Type of toast: success or error
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          let filteredUsers;

          if (currentUser.role === 'admin') {
            filteredUsers = data.filter(
              (user) =>
                user.role === 'staff' &&
                user.department === currentUser.department &&
                user.id !== currentUser.id
            );
          } else if (currentUser.role === 'superAdmin') {
            filteredUsers = data.filter((user) => user.id !== currentUser.id);
          }

          setUsers(filteredUsers);
        } else {
          console.error('Failed to fetch users:', res.statusText);
        }
      } catch (error) {
        console.error('Error fetching users:', error.message);
      }
    };

    if (['admin', 'superAdmin'].includes(currentUser.role)) {
      fetchUsers();
    }
  }, [currentUser.id, currentUser.role, currentUser.department]);

  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = users.filter((user) => {
      const matchesName =
        user.firstName.toLowerCase().includes(lowerCaseSearchTerm) ||
        user.lastName.toLowerCase().includes(lowerCaseSearchTerm) ||
        user.middleName.toLowerCase().includes(lowerCaseSearchTerm);
      const matchesDepartment = user.department
        .toLowerCase()
        .includes(lowerCaseSearchTerm);
      const matchesRole = user.role.toLowerCase().includes(lowerCaseSearchTerm);
      return matchesName || matchesDepartment || matchesRole;
    });
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleDeleteUser = async () => {
    try {
      const res = await fetch(`/api/users/${userIdToDelete}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setToastType('success');
        setToastMessage('User deleted successfully');
        setUsers(users.filter((user) => user.id !== userIdToDelete));
      } else {
        setToastType('error');
        setToastMessage('Failed to delete user');
      }
    } catch (error) {
      setToastType('error');
      setToastMessage('Error deleting user');
    } finally {
      setShowModal(false);
    }
  };

  const handleAddUserModal = () => {
    setUserToEdit(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setUserToEdit(user);
    setShowUserModal(true);
  };

  const handleUserSave = async (user) => {
    try {
      const method = user.id ? 'PUT' : 'POST';
      const url = user.id ? `/api/users/${user.id}` : '/api/users';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setToastType('success');
        setToastMessage(
          user.id ? 'User updated successfully' : 'User added successfully'
        );
        setUsers((users) =>
          user.id
            ? users.map((u) => (u.id === user.id ? updatedUser : u))
            : [...users, updatedUser]
        );
      } else {
        setToastType('error');
        setToastMessage('Failed to save user');
      }
    } catch (error) {
      setToastType('error');
      setToastMessage('Error saving user');
    } finally {
      setShowUserModal(false);
    }
  };

  const renderToast = () => {
    if (toastMessage) {
      return (
        <Toast className="fixed top-4 right-4 z-50" onClose={() => setToastMessage(null)}>
          <div
            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              toastType === 'success'
                ? 'bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200'
                : 'bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200'
            }`}
          >
            {toastType === 'success' ? (
              <HiCheckCircle className="h-5 w-5" />
            ) : (
              <HiXCircle className="h-5 w-5" />
            )}
          </div>
          <div className="ml-3 text-sm font-normal">{toastMessage}</div>
          <Toast.Toggle />
        </Toast>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500 overflow-x-auto">
      {renderToast()}
      <div className="p-3 w-full overflow-x-auto flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
          All Users
        </h1>
      </div>

      <div className="mb-4 w-full flex items-center justify-between">
        <div className="flex-grow mr-4">
          <TextInput
            type="text"
            placeholder="Search by name, department, or role..."
            rightIcon={AiOutlineSearch}
            className="w-full sm:w-96"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          onClick={handleAddUserModal}
          color="blue"
          className="flex items-center"
        >
          <HiPlus className="w-5 h-5 mr-2 -ml-1" />
          Add user
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table
          hoverable
          className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400"
        >
          <Table.Head className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Username</Table.HeadCell>
            <Table.HeadCell>Email</Table.HeadCell>
            <Table.HeadCell>Department</Table.HeadCell>
            <Table.HeadCell>Role</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
            {filteredUsers.map((user) => (
              <Table.Row
                key={user.id}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <Table.Cell className="px-6 py-4">
                  <div className="flex items-center">
                    {user.profilePicture ? (
                      <img
                        className="w-10 h-10 rounded-full"
                        src={user.profilePicture}
                        alt={user.username}
                      />
                    ) : (
                      <Avatar rounded className="w-10 h-10" />
                    )}
                    <div className="ml-4">
                      <div className="text-base font-semibold text-gray-900 dark:text-white">
                        {user.firstName} {user.middleName} {user.lastName}
                      </div>
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell className="px-6 py-4">{user.username}</Table.Cell>
                <Table.Cell className="px-6 py-4">{user.email}</Table.Cell>
                <Table.Cell className="px-6 py-4">{user.department}</Table.Cell>
                <Table.Cell className="px-6 py-4">{user.role}</Table.Cell>
                <Table.Cell className="px-6 py-4">
                  <div className="flex items-center ml-auto space-x-2 sm:space-x-3">
                    <Button onClick={() => handleEditUser(user)} color="blue">
                      <HiPencilAlt className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <Button
                      onClick={() => {
                        setShowModal(true);
                        setUserIdToDelete(user.id);
                      }}
                      color="failure"
                    >
                      <HiTrash className="w-4 h-4 mr-2" /> Delete
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this user?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteUser}>
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      {/* Reusable User Modal for Add/Edit */}
      <UserModal
        show={showUserModal}
        onClose={() => setShowUserModal(false)}
        user={userToEdit}
        onSave={handleUserSave}
        departments={departments}
        currentUser={currentUser}
      />
    </div>
  );
}
