'use client'
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io(`${process.env.NEXT_PUBLIC_API_URL}`,{transports : ['websocket']});

interface Item {
    _id:string;
    name: string;
    value: number;
}

export default function Homepage(){
    const [items, setItems] = useState<Item[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Request all items from the server
                socket.emit('getAllItems');
                socket.on('allItems', (allItems: Item[]) => {
                    setItems(allItems);
                });
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };

        // Listen for real-time updates
        socket.on('dataUpdate', (updatedItem: Item) => {
            setItems((prevItems) => {
                const updatedItems = prevItems.map((item) =>
                    item._id === updatedItem._id ? updatedItem : item
                );
                return [...updatedItems];
            });
        });

        socket.on('dataAdded', handleDataAdded);

        socket.on('dataDeleted', handleDataDeleted);

        fetchData();

        // Cleanup the socket connection when the component unmounts
        return () => {
            socket.off('dataUpdate');
            socket.off('dataAdded', handleDataAdded);
            socket.off('dataDeleted', handleDataDeleted);
        };
    }, []);

    const editData = (itemId: string, updatedData: Partial<Item>) => {
        socket.emit('editItem', { _id: itemId, ...updatedData });
    };

    const deleteData = (toDelData: Item) => {
        socket.emit('deleteData', toDelData);
    };

    const addNewData = () => {
        try {
            const newName = prompt('Enter the name for the new item:');
            const newValueString = prompt('Enter the value for the new item:');
            
            if (newName && newValueString !== null) {
                const newValue = Number(newValueString);
                if (!isNaN(newValue)) {
                    socket.emit('addData', { name: newName, value: newValue });
                } else {
                    console.error('Invalid number entered for the new item value');
                }
            }
        } catch (error) {
            console.error('Error adding new data:', error);
        }
    };

    const handleDataAdded = (createdItem: Item) => {
        setItems((prevItems) => {
            const existingItem = prevItems.find((item) => item._id === createdItem._id);
            if (!existingItem) {
                // Add the new item if it doesn't exist in the list
                return [...prevItems, createdItem];
            }
            // Otherwise, update the existing item
            const updatedItems = prevItems.map((item) =>
                item._id === createdItem._id ? createdItem : item
            );
            return updatedItems;
        });
    };

    const handleDataDeleted = (deletedItem: Item) => {
        setItems((prevItems) => prevItems.filter((item) => item._id !== deletedItem._id));
    };

    return (
        <div className='w-screen md:w-[90vh] px-10 md:px-0'>
            <div className='w-full flex justify-between border-b border-gray-200 p-1'>
                <h1 className='text-4xl font-bold'>Items</h1>
                <button className='bg-blue-500 text-white py-1 px-2 rounded' onClick={addNewData}>Add New Data</button>
            </div>
            <table className='w-full overflow-x-auto'>
                <thead className='w-full text-left border-b border-gray-200'>
                    <tr>
                        <th className='py-2 px-4'>Name</th>
                        <th className='py-2 px-4'>Value</th>
                        <th className='py-2 px-4'>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item._id} className='border-b border-gray-200'>
                            <td className='py-2 px-4'>{item.name}</td>
                            <td className='py-2 px-4'>{item.value}</td>
                            <td className='flex justify-between gap-3 py-2 px-4'>
                                <button
                                    onClick={() => {
                                        const newValue = prompt('Enter new value:', String(item.value));
                                        if (newValue !== null) {
                                            const numericValue = Number(newValue);
                                            if (!isNaN(numericValue)) {
                                                editData(item._id, { value: numericValue });
                                            } else {
                                                console.error('Invalid number entered');
                                            }
                                        }
                                    }}
                                    className='bg-blue-500 text-white py-1 px-2 rounded'
                                >
                                    Edit Value
                                </button>
                                <button
                                    onClick={() => {
                                        deleteData(item)
                                    }}
                                    className='bg-blue-500 text-white py-1 px-2 rounded'
                                >
                                    Delete Value
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}