import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { fontScale, heightScale, widthScale } from '../helpers/scale';
import { fontFamilies } from '../assets/themes/fonts';

const emptyTicket = { title: '', price: '0', available: '', max_per_user: '1' };

const TicketTypes = ({ value = [], onChange }) => {
  const [tickets, setTickets] = useState(Array.isArray(value) ? value : []);
  const [visible, setVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [draft, setDraft] = useState(emptyTicket);
  const [error, setError] = useState('');

  useEffect(() => {
    setTickets(Array.isArray(value) ? value : []);
  }, [value]);

  const updateTickets = next => {
    setTickets(next);
    onChange?.(next);
  };

  const openNew = () => {
    setEditingIndex(null);
    setDraft(emptyTicket);
    setError('');
    setVisible(true);
  };

  const openEdit = index => {
    const ticket = tickets[index] || emptyTicket;
    setEditingIndex(index);
    setDraft({
      title: ticket.title || '',
      price: String(ticket.price ?? '0'),
      available: String(ticket.available ?? ''),
      max_per_user: String(ticket.max_per_user ?? '1'),
    });
    setError('');
    setVisible(true);
  };

  const save = () => {
    const title = draft.title.trim();
    const available = Number(draft.available);
    const maxPerUser = Number(draft.max_per_user);
    if (!title) {
      setError('Ticket name is required.');
      return;
    }
    if (!Number.isInteger(available) || available < 1) {
      setError('Capacity must be a positive whole number.');
      return;
    }
    if (!Number.isInteger(maxPerUser) || maxPerUser < 1) {
      setError('Maximum per user must be a positive whole number.');
      return;
    }

    const nextTicket = {
      ...draft,
      title,
      price: '0',
      available: String(available),
      max_per_user: String(maxPerUser),
    };
    const next = [...tickets];
    if (editingIndex == null) next.push(nextTicket);
    else next[editingIndex] = { ...next[editingIndex], ...nextTicket };
    updateTickets(next);
    setVisible(false);
    setDraft(emptyTicket);
  };

  const remove = index => updateTickets(tickets.filter((_, itemIndex) => itemIndex !== index));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.title}>Ticket types</Text>
          <Text style={styles.hint}>Configure free capacity and the maximum quantity per User.</Text>
        </View>
        <TouchableOpacity accessibilityLabel="Add ticket type" accessibilityRole="button" onPress={openNew} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      {tickets.length === 0 ? (
        <Text style={styles.empty}>No ticket type added. Publish will use the listing capacity.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tickets.map((ticket, index) => (
            <TouchableOpacity key={`${ticket.id || 'new'}-${index}`} onPress={() => openEdit(index)} style={styles.ticketCard}>
              <View style={styles.ticketCardHeader}>
                <Text style={styles.ticketName} numberOfLines={1}>{ticket.title}</Text>
                <TouchableOpacity accessibilityLabel={`Delete ${ticket.title}`} onPress={() => remove(index)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.ticketMeta}>FREE · Capacity {ticket.available || 0}</Text>
              <Text style={styles.ticketMeta}>Max per User: {ticket.max_per_user || 1}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={styles.backdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editingIndex == null ? 'Add ticket type' : 'Edit ticket type'}</Text>
            <TextInput value={draft.title} onChangeText={title => setDraft(previous => ({ ...previous, title }))} placeholder="Ticket name" placeholderTextColor="#8D8595" style={styles.input} />
            <TextInput value={draft.available} onChangeText={available => setDraft(previous => ({ ...previous, available }))} placeholder="Capacity" placeholderTextColor="#8D8595" keyboardType="number-pad" style={styles.input} />
            <TextInput value={draft.max_per_user} onChangeText={max_per_user => setDraft(previous => ({ ...previous, max_per_user }))} placeholder="Maximum per User" placeholderTextColor="#8D8595" keyboardType="number-pad" style={styles.input} />
            <Text style={styles.freeHint}>Price: FREE (paid checkout remains outside this parity pass).</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => setVisible(false)} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={save} style={styles.saveButton}><Text style={styles.saveText}>Save</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: heightScale(18) },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  copy: { flex: 1, paddingRight: widthScale(12) },
  title: { color: '#161616', fontFamily: fontFamilies.SFProRoundedBlackMedium, fontSize: fontScale(16) },
  hint: { color: '#6F6878', fontFamily: fontFamilies.SFProRoundedBlackRegular, fontSize: fontScale(11), marginTop: heightScale(4) },
  addButton: { alignItems: 'center', backgroundColor: '#3E146F', borderRadius: widthScale(18), justifyContent: 'center', minHeight: heightScale(34), paddingHorizontal: widthScale(16) },
  addButtonText: { color: '#FFFFFF', fontFamily: fontFamilies.SFProRoundedBlackBold, fontSize: fontScale(11) },
  empty: { color: '#6F6878', fontFamily: fontFamilies.SFProRoundedBlackRegular, fontSize: fontScale(12), marginTop: heightScale(12) },
  ticketCard: { backgroundColor: '#F5F1FB', borderColor: '#E4DEF1', borderRadius: widthScale(16), borderWidth: 1, marginRight: widthScale(12), marginTop: heightScale(12), minWidth: widthScale(190), padding: widthScale(14) },
  ticketCardHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: widthScale(8) },
  ticketName: { color: '#17101F', flex: 1, fontFamily: fontFamilies.SFProRoundedBlackBold, fontSize: fontScale(13) },
  deleteText: { color: '#DB3171', fontFamily: fontFamilies.SFProRoundedBlackMedium, fontSize: fontScale(10) },
  ticketMeta: { color: '#6F6878', fontFamily: fontFamilies.SFProRoundedBlackRegular, fontSize: fontScale(11), marginTop: heightScale(6) },
  backdrop: { backgroundColor: '#00000066', flex: 1, justifyContent: 'flex-end' },
  modal: { backgroundColor: '#FFFFFF', borderTopLeftRadius: widthScale(28), borderTopRightRadius: widthScale(28), padding: widthScale(24) },
  modalTitle: { color: '#17101F', fontFamily: fontFamilies.SFProRoundedBlackBold, fontSize: fontScale(20) },
  input: { backgroundColor: '#F5F1FB', borderColor: '#E4DEF1', borderRadius: widthScale(16), borderWidth: 1, color: '#17101F', fontFamily: fontFamilies.SFProRoundedBlackRegular, fontSize: fontScale(14), marginTop: heightScale(14), minHeight: heightScale(48), paddingHorizontal: widthScale(14) },
  freeHint: { color: '#6F6878', fontFamily: fontFamilies.SFProRoundedBlackRegular, fontSize: fontScale(11), marginTop: heightScale(12) },
  error: { color: '#B42318', fontFamily: fontFamilies.SFProRoundedBlackMedium, fontSize: fontScale(11), marginTop: heightScale(10) },
  actions: { flexDirection: 'row', gap: widthScale(12), marginTop: heightScale(18) },
  cancelButton: { alignItems: 'center', borderColor: '#3E146F', borderRadius: widthScale(24), borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: heightScale(48) },
  cancelText: { color: '#3E146F', fontFamily: fontFamilies.SFProRoundedBlackBold, fontSize: fontScale(14) },
  saveButton: { alignItems: 'center', backgroundColor: '#DB3171', borderRadius: widthScale(24), flex: 1, justifyContent: 'center', minHeight: heightScale(48) },
  saveText: { color: '#FFFFFF', fontFamily: fontFamilies.SFProRoundedBlackBold, fontSize: fontScale(14) },
});

export default TicketTypes;
