import { useState } from 'react';
import { usePosData } from '@/hooks/usePosData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const CategoryManagement = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = usePosData();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryName, setEditCategoryName] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addCategory(newCategoryName)) {
      toast({
        title: "Category Added",
        description: `"${newCategoryName}" has been added successfully`,
      });
      setNewCategoryName('');
      setShowAddForm(false);
    } else {
      toast({
        title: "Error",
        description: "Category already exists or is invalid",
        variant: "destructive",
      });
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory && updateCategory(editingCategory, editCategoryName)) {
      toast({
        title: "Category Updated",
        description: `"${editingCategory}" has been updated to "${editCategoryName}"`,
      });
      setEditingCategory(null);
      setEditCategoryName('');
    } else {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (categoryName: string) => {
    if (confirm(`Are you sure you want to delete "${categoryName}"?`)) {
      if (deleteCategory(categoryName)) {
        toast({
          title: "Category Deleted",
          description: `"${categoryName}" has been deleted successfully`,
        });
      } else {
        toast({
          title: "Error",
          description: "Cannot delete category that is in use",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Category Management</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Manage product categories for your store
        </p>
      </div>

      <Card className="pos-card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Categories ({categories.length})</span>
            <Button onClick={() => setShowAddForm(true)} className="pos-button-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <Card className="mb-4">
              <CardContent className="pt-4">
                <form onSubmit={handleAddSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="newCategoryName">New Category Name</Label>
                    <Input
                      id="newCategoryName"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Enter category name"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Add</Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {editingCategory && (
            <Card className="mb-4">
              <CardContent className="pt-4">
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="editCategoryName">Edit Category Name</Label>
                    <Input
                      id="editCategoryName"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      placeholder="Enter new category name"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Update</Button>
                    <Button type="button" variant="outline" onClick={() => setEditingCategory(null)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {categories.length === 0 ? (
            <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
              <p>No categories found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category}>
                    <TableCell>
                      <Badge variant="secondary">{category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingCategory(category);
                            setEditCategoryName(category);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(category)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
            </Card>
          </div>
      
  );
};
