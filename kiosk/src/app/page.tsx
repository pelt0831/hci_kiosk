'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStores } from '../context/StoreContext';

const KioskPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [tableNumber, setTableNumber] = useState<string>('');
  const router = useRouter();
  const { stores } = useStores();
  const selectedStoreId = 1;  // Example store ID for 맘스터치 건대로데오점
  const store = stores.find(store => store.id === selectedStoreId);
  const categories = store?.categories || [];
  const selectedItems = categories.find(category => category.id === selectedCategory)?.items || [];

  useEffect(() => {
    if (store?.isServingStore) {
      const storedTableNumber = localStorage.getItem('tableNumber');
      if (!storedTableNumber) {
        setIsModalOpen(true);
      } else {
        setTableNumber(storedTableNumber);
      }
    }
  }, [store]);

  const handleCategoryClick = (id: number) => setSelectedCategory(id);

  const handleTableNumberSubmit = () => {
    if (tableNumber && parseInt(tableNumber, 10) >= 1 && parseInt(tableNumber, 10) <= 30) {
      localStorage.setItem('tableNumber', tableNumber);
      setIsModalOpen(false);
    } else {
      alert('테이블 번호는 1에서 30 사이의 값이어야 합니다.');
    }
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);
  const startX = useRef<number>(0);
  const scrollLeft = useRef<number>(0);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    if (!scrollRef.current) return;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const onMouseLeaveOrUp = () => {
    isDragging.current = false;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX.current;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  if (!store) {
    return <div>Store not found</div>;
  }

  return (
    <div className="font-sans text-center bg-white min-h-screen relative">
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center w-11/12 max-w-md">
            <h2 className="text-2xl font-bold mb-4">알림</h2>
            <p className="mb-4">서빙 서비스를 제공하는 매장입니다.<br />테이블에 적혀있는 테이블 번호를 입력해주세요.</p>
            <input
              type="number"
              value={tableNumber}
              onChange={e => setTableNumber(e.target.value)}
              className="border border-gray-300 p-2 w-full mb-4"
              placeholder="테이블 번호 입력"
              min={1}
              max={30}
            />
            <button
              onClick={handleTableNumberSubmit}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg w-full"
            >
              확인
            </button>
          </div>
        </div>
      )}
      <header className="relative w-full h-56">
        <Image src={store.imageUrl || '/default.jpg'} alt="Restaurant" layout="fill" objectFit="cover" className="w-full h-full object-cover" />
      </header>
      <h1 className="text-3xl font-bold my-4">{store.name}</h1>
      <nav
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeaveOrUp}
        onMouseUp={onMouseLeaveOrUp}
        onMouseMove={onMouseMove}
        className="relative flex justify-start overflow-x-auto whitespace-nowrap mt-0 px-4 cursor-grab active:cursor-grabbing h-32 items-center custom-scroll"
      >
        {categories.map(category => (
          <button
            key={category.id}
            className={`flex-shrink-0 px-6 py-3 mx-2 text-xl rounded-full ${category.id === selectedCategory ? 'bg-gray-800 text-white' : 'bg-gray-300'}`}
            onClick={() => handleCategoryClick(category.id)}
          >
            {category.name}
          </button>
        ))}
      </nav>
      <main className="p-4 bg-white mt-0">
        {selectedItems.map(item => (
          <div key={item.id} className="flex items-center cursor-pointer border-b py-4" onClick={() => router.push(`/menu/${store.id}/${selectedCategory}/${item.id}`)}>
            <div className="flex-shrink-0 mr-4" style={{ width: '210px', height: '150px' }}>
              <Image src={item.imageUrl} alt={item.name} width={210} height={150} className="object-contain w-full h-full" />
            </div>
            <div className="text-left flex-1">
              <h2 className="text-2xl font-bold">{item.name}</h2>
              <p className="text-lg text-gray-500 mt-2">
                {item.setPrice ? `단품 ${item.price.toLocaleString()}원 세트 ${item.setPrice.toLocaleString()}원` : `${item.price.toLocaleString()}원`}
              </p>
            </div>
          </div>
        ))}
      </main>
      {selectedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg p-4">
          <button className="bg-orange-500 text-white w-full py-2 rounded-lg">
            총 {selectedItems.reduce((acc, item) => {
              const itemTotal = item.price * (item.quantity || 0);
              const setItemTotal = item.setPrice ? item.setPrice * (item.setQuantity || 0) : 0;
              return acc + itemTotal + setItemTotal;
            }, 0).toLocaleString()}원 주문하기
          </button>
        </div>
      )}
    </div>
  );
};

export default KioskPage;
