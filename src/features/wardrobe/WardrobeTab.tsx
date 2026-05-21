import React from 'react';
import { Dispatch, SetStateAction } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SectionCard } from '../../components/SectionCard';
import { TextStyleProp, ViewStyleProp } from '../types';
import { Occasion, WardrobeCategory, WardrobeItem, categoryOptions, occasionOptions, seasonOptions, Season } from '../../types';

export type WardrobeFormState = {
  name: string;
  color: string;
  category: WardrobeCategory;
  season: Season;
  occasionTags: Occasion[];
};

type WardrobeStyles = {
  input: TextStyleProp;
  wrap: ViewStyleProp;
  tag: ViewStyleProp;
  tagActive: ViewStyleProp;
  tagText: TextStyleProp;
  tagTextActive: TextStyleProp;
  row: ViewStyleProp;
  button: ViewStyleProp;
  buttonText: TextStyleProp;
  secondary: ViewStyleProp;
  secondaryText: TextStyleProp;
  inventory: ViewStyleProp;
  line: TextStyleProp;
  subtle: TextStyleProp;
};

export type WardrobeTabProps = {
  styles: WardrobeStyles;
  editingId: string | null;
  form: WardrobeFormState;
  setForm: Dispatch<SetStateAction<WardrobeFormState>>;
  toggleFormOccasion: (occasion: Occasion) => void;
  saveItem: () => void;
  setEditingId: Dispatch<SetStateAction<string | null>>;
  emptyForm: WardrobeFormState;
  wardrobe: WardrobeItem[];
  editItem: (item: WardrobeItem) => void;
  deleteWardrobeItem: (id: string) => void;
  formatDaysAgo: (days: number) => string;
};

export function WardrobeTab(props: WardrobeTabProps) {
  const { styles, editingId, form, setForm, toggleFormOccasion, saveItem, setEditingId, emptyForm, wardrobe, editItem, deleteWardrobeItem, formatDaysAgo } = props;
  return <>
    <SectionCard title={editingId ? 'Edit item' : 'Add item'} subtitle="Capture and tag wardrobe metadata">
      <TextInput value={form.name} onChangeText={(text) => setForm((current) => ({ ...current, name: text }))} placeholder="Item name" style={styles.input} />
      <TextInput value={form.color} onChangeText={(text) => setForm((current) => ({ ...current, color: text }))} placeholder="Color" style={styles.input} />
      <View style={styles.wrap}>{categoryOptions.map((category) => <TouchableOpacity key={category} style={[styles.tag, form.category === category && styles.tagActive]} onPress={() => setForm((current) => ({ ...current, category }))}><Text style={[styles.tagText, form.category === category && styles.tagTextActive]}>{category}</Text></TouchableOpacity>)}</View>
      <View style={styles.wrap}>{seasonOptions.map((season) => <TouchableOpacity key={season} style={[styles.tag, form.season === season && styles.tagActive]} onPress={() => setForm((current) => ({ ...current, season }))}><Text style={[styles.tagText, form.season === season && styles.tagTextActive]}>{season}</Text></TouchableOpacity>)}</View>
      <View style={styles.wrap}>{occasionOptions.map((occasion) => { const selected = form.occasionTags.includes(occasion); return <TouchableOpacity key={occasion} style={[styles.tag, selected && styles.tagActive]} onPress={() => toggleFormOccasion(occasion)}><Text style={[styles.tagText, selected && styles.tagTextActive]}>{occasion}</Text></TouchableOpacity>; })}</View>
      <View style={styles.row}><TouchableOpacity style={styles.button} onPress={saveItem}><Text style={styles.buttonText}>{editingId ? 'Save' : 'Add item'}</Text></TouchableOpacity>{editingId ? <TouchableOpacity style={styles.secondary} onPress={() => { setEditingId(null); setForm(emptyForm); }}><Text style={styles.secondaryText}>Cancel</Text></TouchableOpacity> : null}</View>
    </SectionCard>
    <SectionCard title="Wardrobe inventory" subtitle={`${wardrobe.length} items persisted locally`}>{wardrobe.map((item) => <View key={item.id} style={styles.inventory}><Text style={styles.line}>{item.name} · {item.category} · {item.color}</Text><Text style={styles.subtle}>Tags: {item.occasionTags.join(', ')} · wears {item.wearCount} · {formatDaysAgo(item.lastWornDaysAgo)}</Text><View style={styles.row}><TouchableOpacity style={styles.secondary} onPress={() => editItem(item)}><Text style={styles.secondaryText}>Edit</Text></TouchableOpacity><TouchableOpacity style={styles.secondary} onPress={() => deleteWardrobeItem(item.id)}><Text style={styles.secondaryText}>Delete</Text></TouchableOpacity></View></View>)}</SectionCard>
  </>;
}
