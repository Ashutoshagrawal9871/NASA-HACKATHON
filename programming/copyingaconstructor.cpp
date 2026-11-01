#include<iostream>
using namespace std;
class copyconstructor 
{
    private:
    int x,y;
    public:
    copyconstructor(int x1,int y1)
    {
        x=x1;
        y=y1;
}
   copyconstructor(copyconstructor  &sample)
   {
    x=sample.x;
    y=sample.y;
   }
   void display()
   {
    cout<<x<<" "<<y<<endl;
   }
};
 int main()  
 {
    copyconstructor object1(10,15);
   copyconstructor object2=object1;
   cout<<"Normal"<<endl;
   void display();
   cout<<"cpoy :"<<endl;
   void display();
 
 }
