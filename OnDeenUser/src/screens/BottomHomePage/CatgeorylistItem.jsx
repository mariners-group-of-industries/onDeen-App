import React from 'react';
import { FlatList, View } from 'react-native';
import ListItem from '../../helpers/listItems';
import { useFilter } from '../../context/FilterContext';

export default function CatgeorylistItem({
  catgeorylist = [],
  selectedFilters,
  setSelectedFilters,
}) {

  const { filter1, setFilter1, hithomepageapi, setHithomepageapi } = useFilter();

  const selectCategopery = (item) => {
    if (item?.id) {
      setFilter1('category_id', [item?.id])
    }
    else {
      setFilter1('category_id', [])
    }
    setHithomepageapi(hithomepageapi + 1)
  }
  const selectedCategories = filter1?.category_id || [];
  const displayCategoryName = (name) => {
    const labels = {
      'Community Service': 'Community Services',
      Course: 'Courses',
      Tour: 'Tours',
    };
    return labels[name] || name;
  };

  const renderItem = ({ item }) => (
    <ListItem
      item={item}
      name={displayCategoryName(item.title)}
      imageUri={item.image}
      onPress={() => selectCategopery(item)}
      selected={selectedCategories?.includes(item.id)} 
    />
  );
  return (
    <FlatList
      data={catgeorylist}
      horizontal
      ListHeaderComponent={
        <ListItem
          name="All categories"
          selected={filter1?.category_id[0] == null}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          onPress={() => { selectCategopery({ id: '' }) }}
          isAllItem={true}
        />
      }
      renderItem={renderItem}
      keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 15 }}
    />
  );
}
